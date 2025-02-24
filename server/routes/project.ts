import { Hono } from 'hono';
import { db } from '../db';
import { project } from '../db/schema/project';
import { and, desc, eq, sql } from 'drizzle-orm';
import { insertProjectSchema } from '../db/schema/project';
import { requireAuth } from '../auth/middleware';
import { projectMember, ProjectRole } from '../db/schema/projectMember';
import { sendEmail } from '../email';
import { user } from '../db/schema/user';
import { projectRole, ProjectRoleType } from '../db/schema/projectRole';
import {
  insertProjectResourceSchema,
  projectResource,
} from '../db/schema/projectResource';
import { checkPermission } from '../utils/permissionUtils';

export const projectRoute = new Hono()
  .use('/*', requireAuth)

  // Get all projects for a user
  .get('/', async (c) => {
    const user = c.var.user;

    try {
      const projects = await db.query.project.findMany({
        where: (project, { exists, eq, and }) =>
          exists(
            db
              .select()
              .from(projectMember)
              .where(
                and(
                  eq(projectMember.projectId, project.id),
                  eq(projectMember.userId, user.id)
                )
              )
          ),
        with: {
          tasks: {
            with: {
              assignee: true,
              notes: {
                with: {
                  author: true,
                },
              },
              comments: {
                with: {
                  author: true,
                },
              },
            },
          },
          members: {
            with: {
              user: true,
            },
          },
        },
      });

      return c.json(projects);
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch projects' }, 500);
    }
  })

  // Get project with members and tasks
  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const user = c.var.user;

    try {
      const result = await db.query.project.findFirst({
        where: eq(project.id, id),
        with: {
          tasks: {
            with: {
              assignee: true,
              notes: {
                with: {
                  author: true,
                },
              },
              comments: {
                with: {
                  author: true,
                },
              },
            },
          },
          members: {
            with: {
              user: true,
            },
          },
          resources: {
            orderBy: [
              desc(projectResource.isPinned),
              desc(projectResource.createdAt),
            ],
          },
        },
      });

      if (!result) {
        return c.json({ error: 'Project not found' }, 404);
      }

      return c.json(result);
    } catch (error) {
      return c.json({ error: 'Failed to fetch project' }, 500);
    }
  })

  // Create new project and set owner
  .post('/', async (c) => {
    const data = await c.req.json();
    const user = c.var.user;

    try {
      const validatedData = insertProjectSchema.parse({
        ...data,
        ownerId: user.id,
      });

      const [newProject] = await db
        .insert(project)
        .values(validatedData)
        .returning();

      // Get the owner role ID
      const ownerRole = await db.query.projectRole.findFirst({
        where: eq(projectRole.name, ProjectRoleType.OWNER),
      });
      if (!ownerRole) {
        throw new Error('Owner role not found');
      }

      // Add creator as project owner with the correct role ID
      await db.insert(projectMember).values({
        projectId: newProject.id,
        userId: user.id,
        roleId: ownerRole.id,
      });

      return c.json(newProject);
    } catch (error) {
      return c.json({ error: 'Failed to create project' }, 500);
    }
  })

  // Update project
  .patch('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await c.req.json();
    const user = c.var.user;

    if (!(await checkPermission(user, 'edit_project', id))) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    try {
      // Check if user owns the project
      const projectResult = await db.query.project.findFirst({
        where: eq(project.id, id),
      });

      if (!projectResult) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const [updated] = await db
        .update(project)
        .set(data)
        .where(eq(project.id, id))
        .returning();

      return c.json(updated);
    } catch (error) {
      return c.json({ error: 'Failed to update project' }, 500);
    }
  })

  // Delete project
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const user = c.var.user;

    if (!(await checkPermission(user, 'delete_project', id))) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    try {
      // Check if user owns the project
      const projectResult = await db.query.project.findFirst({
        where: eq(project.id, id),
      });

      if (!projectResult) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      await db.delete(project).where(eq(project.id, id));
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to delete project' }, 500);
    }
  })

  // Add member to project
  .post('/:id/members', async (c) => {
    const projectId = Number(c.req.param('id'));
    const { email, roleName } = await c.req.json();
    const currentUser = c.var.user;

    if (!(await checkPermission(currentUser, 'invite_to_project', projectId))) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    try {
      // Check if user is project owner
      const member = await db.query.projectMember.findFirst({
        where: (members, { and, eq }) =>
          and(
            eq(members.projectId, projectId),
            eq(members.userId, currentUser.id)
          ),
        with: {
          role: true,
        },
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      // Find user by email
      const invitedUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (!invitedUser) {
        return c.json({ error: 'User not found' }, 404);
      }
      // Get the role ID for the specified role name
      const role = await db.query.projectRole.findFirst({
        where: eq(projectRole.name, roleName),
      });

      if (!role) {
        return c.json({ error: 'Invalid role' }, 400);
      }

      // Add member with the correct role ID
      const [newMember] = await db
        .insert(projectMember)
        .values({
          projectId,
          userId: invitedUser.id,
          roleId: role.id,
        })
        .returning();

      await sendEmail(
        email,
        'You have been added to a project',
        `<p>You have been added to a project. You can view the project <a href="https://devspace.app/projects/${projectId}">here</a></p>`
      );

      return c.json(newMember);
    } catch (error) {
      return c.json({ error: 'Failed to add member' }, 500);
    }
  })

  // Get project resources
  .get('/:id/resources', async (c) => {
    const projectId = Number(c.req.param('id'));
    const user = c.var.user;

    try {
      const projectResult = await db.query.project.findFirst({
        where: eq(project.id, projectId),
      });

      if (!projectResult) {
        return c.json({ error: 'Project not found' }, 404);
      }

      const resources = await db.query.projectResource.findMany({
        where: eq(projectResource.projectId, projectId),
        orderBy: [
          desc(projectResource.isPinned),
          desc(projectResource.createdAt),
        ],
      });

      return c.json(resources);
    } catch (error) {
      return c.json({ error: 'Failed to fetch resources' }, 500);
    }
  })

  // Create project resource
  .post('/:id/resources', async (c) => {
    const projectId = Number(c.req.param('id'));
    const data = await c.req.json();
    const user = c.var.user;

    if (!(await checkPermission(user, 'create_resource', projectId))) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    try {
      const validatedData = insertProjectResourceSchema.parse({
        ...data,
        projectId,
      });

      const [newResource] = await db
        .insert(projectResource)
        .values(validatedData)
        .returning();

      return c.json(newResource);
    } catch (error) {
      return c.json({ error: 'Failed to create resource' }, 500);
    }
  })

  // Delete project resource
  .delete('/:projectId/resource/:resourceId', async (c) => {
    const projectId = Number(c.req.param('projectId'));
    const resourceId = Number(c.req.param('resourceId'));
    const user = c.var.user;

    if (!(await checkPermission(user, 'delete_resource', projectId))) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    try {
      const resource = await db.query.projectResource.findFirst({
        where: and(
          eq(projectResource.id, resourceId),
          eq(projectResource.projectId, projectId)
        ),
      });

      if (!resource) {
        return c.json({ error: 'Resource not found' }, 404);
      }

      await db
        .delete(projectResource)
        .where(eq(projectResource.id, resourceId));

      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to delete resource' }, 500);
    }
  })

  // Toggle pin status
  .patch('/:projectId/resources/:resourceId/toggle-pin', async (c) => {
    const projectId = Number(c.req.param('projectId'));
    const resourceId = Number(c.req.param('resourceId'));

    try {
      const [resource] = await db
        .update(projectResource)
        .set({
          isPinned: sql`NOT ${projectResource.isPinned}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectResource.id, resourceId),
            eq(projectResource.projectId, projectId)
          )
        )
        .returning();

      if (!resource) {
        return c.json({ error: 'Resource not found' }, 404);
      }

      return c.json(resource);
    } catch (error) {
      return c.json({ error: 'Failed to toggle pin status' }, 500);
    }
  });

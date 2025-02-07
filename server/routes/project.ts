import { Hono } from 'hono';
import { db } from '../db';
import { project } from '../db/schema/project';
import { eq } from 'drizzle-orm';
import { insertProjectSchema } from '../db/schema/project';
import { requireAuth } from '../auth/middleware';
import { projectMember, ProjectRole } from '../db/schema/projectMember';
import { sendEmail } from '../email';
import { user } from '../db/schema/user';

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

      // Add creator as project owner
      await db.insert(projectMember).values({
        projectId: newProject.id,
        userId: user.id,
        role: ProjectRole.OWNER,
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
    const { email, role } = await c.req.json();
    const currentUser = c.var.user;

    try {
      // Check if user is project owner
      const member = await db.query.projectMember.findFirst({
        where: (members, { and, eq }) =>
          and(
            eq(members.projectId, projectId),
            eq(members.userId, currentUser.id),
            eq(members.role, ProjectRole.OWNER)
          ),
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

      // Add member
      const [newMember] = await db
        .insert(projectMember)
        .values({
          projectId,
          userId: invitedUser.id,
          role,
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
  });

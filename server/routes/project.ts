import { Hono } from 'hono';
import { db } from '../db';
import { project } from '../db/schema/project';
import { eq } from 'drizzle-orm';
import { insertProjectSchema } from '../db/schema/project';
import { requireAuth } from '../auth/middleware';

export const projectRoute = new Hono()
  .use('/*', requireAuth)
  // Get project with its tasks
  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    // const user = c.var.user;

    try {
      const result = await db.query.project.findFirst({
        where: eq(project.id, id),
        with: {
          tasks: true,
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

  // Create new project
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
  });

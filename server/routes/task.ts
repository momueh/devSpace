import { Hono } from 'hono';
import { db } from '../db';
import { task } from '../db/schema/task';
import { eq } from 'drizzle-orm';
import { insertTaskSchema } from '../db/schema/task';
import { project } from '../db/schema/project';
import { requireAuth } from '../auth/middleware';
import { sendEmail } from '../email';

export const taskRoute = new Hono()
  .use('/*', requireAuth)
  // Create new task
  .post('/', async (c) => {
    const data = await c.req.json();
    const user = c.var.user;

    try {
      const validatedData = insertTaskSchema.parse(data);
      const [newTask] = await db.insert(task).values(validatedData).returning();

      return c.json(newTask);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Failed to create task' }, 500);
    }
  })

  // Update task
  .patch('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await c.req.json();
    const user = c.var.user;

    try {
      // Check if task belongs to user's project
      const taskResult = await db.query.task.findFirst({
        where: eq(task.id, id),
        with: {
          project: true,
        },
      });

      if (!taskResult) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const [updated] = await db
        .update(task)
        .set(data)
        .where(eq(task.id, id))
        .returning();

      return c.json(updated);
    } catch (error) {
      return c.json({ error: 'Failed to update task' }, 500);
    }
  })

  // Delete task
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const user = c.var.user;

    try {
      // Check if task belongs to user's project
      const taskResult = await db.query.task.findFirst({
        where: eq(task.id, id),
        with: {
          project: true,
        },
      });

      if (!taskResult) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      await db.delete(task).where(eq(task.id, id));
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to delete task' }, 500);
    }
  });

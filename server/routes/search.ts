import { Hono } from 'hono';
import { db } from '../db';
import { task } from '../db/schema/task';
import { project } from '../db/schema/project';
import { like, or, and, eq } from 'drizzle-orm';
import { requireAuth } from '../auth/middleware';

export const searchRoute = new Hono()
  .use('/*', requireAuth)
  .get('/', async (c) => {
    const query = c.req.query('q');
    const user = c.var.user;

    if (!query) {
      return c.json({ tasks: [], projects: [] });
    }

    try {
      // Search for tasks
      const tasks = await db.query.task.findMany({
        where: and(
          like(task.title, `%${query}%`)
          // Add any other task-related conditions
        ),
        with: {
          project: true,
        },
        limit: 5,
      });

      // Search for projects
      const projects = await db.query.project.findMany({
        where: and(
          like(project.name, `%${query}%`)
          // Add project access conditions
        ),
        limit: 5,
      });

      return c.json({ tasks, projects });
    } catch (error) {
      return c.json({ error: 'Search failed' }, 500);
    }
  });

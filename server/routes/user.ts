import { Hono } from 'hono';
import { db } from '../db';
import { user } from '../db/schema/user';
import { eq } from 'drizzle-orm';

export const userRoute = new Hono()

  // GET /user/:id
  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'));

    try {
      const result = await db.query.user.findFirst({
        where: eq(user.id, id),
        with: {
          nuggetProgress: true,
        },
      });

      if (!result) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json(result);
    } catch (error) {
      return c.json({ error: 'Failed to fetch user' }, 500);
    }
  })

  // PATCH /user/:id
  .patch('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const data = await c.req.json();

    try {
      const [updated] = await db
        .update(user)
        .set(data)
        .where(eq(user.id, id))
        .returning();

      if (!updated) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      return c.json({ error: 'Failed to update user' }, 500);
    }
  })

  // DELETE /user/:id
  .delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));

    try {
      await db.delete(user).where(eq(user.id, id));
      return c.json({ success: true });
    } catch (error) {
      return c.json({ error: 'Failed to delete user' }, 500);
    }
  });

import { Hono } from 'hono';
import { db } from '../db';
import { insertUserSchema, updateUserSchema, user } from '../db/schema/user';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../auth/middleware';

export const userRoute = new Hono()
  .use('/*', requireAuth)
  // GET /user/:id
  .get('/:id', async (c) => {
    const id = Number(c.req.param('id'));

    try {
      const result = await db.query.user.findFirst({
        where: eq(user.id, id),
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
    const userData = c.var.user;

    // Only allow users to update their own profile
    if (userData.id !== id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    try {
      const validatedData = updateUserSchema.parse(data);

      const [updated] = await db
        .update(user)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning();

      if (!updated) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Update error:', error); // Add this for debugging
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

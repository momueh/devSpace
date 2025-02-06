import { Hono } from 'hono';
import { db } from '../db';
import { insertUserSchema, user } from '../db/schema/user';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPasswordHash } from '../auth/password';
import {
  createSession,
  generateRandomSessionToken,
  invalidateSession,
} from '../auth/session';
import { getAuth } from '../auth/middleware';
import { setSessionCookie, deleteSessionCookie } from '../auth/cookie';

export const authRoute = new Hono()
  .post('/register', async (c) => {
    const data = await c.req.json();

    try {
      const passwordHash = await hashPassword(data.password);
      const validatedData = insertUserSchema.parse({
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        passwordHash,
      });

      const [newUser] = await db.insert(user).values(validatedData).returning();

      const sessionToken = generateRandomSessionToken();
      const session = await createSession(sessionToken, newUser.id);

      setSessionCookie(c, sessionToken, session.expiresAt);

      return c.json({ user: newUser });
    } catch (error) {
      return c.json({ error: 'Failed to register user' }, 500);
    }
  })
  .post('/login', async (c) => {
    const { email, password } = await c.req.json();

    try {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (!existingUser) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const validPassword = await verifyPasswordHash(
        existingUser.passwordHash,
        password
      );

      if (!validPassword) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const sessionToken = generateRandomSessionToken();
      const session = await createSession(sessionToken, existingUser.id);

      setSessionCookie(c, sessionToken, session.expiresAt);

      return c.json({ user: existingUser });
    } catch (error) {
      return c.json({ error: 'Failed to login' }, 500);
    }
  })
  .post('/logout', async (c) => {
    const { session } = await getAuth(c);
    if (session) {
      await invalidateSession(session.id);
    }

    deleteSessionCookie(c);
    return c.json({ success: true });
  })
  .get('/me', async (c) => {
    const { user } = await getAuth(c);
    return c.json({ user });
  });

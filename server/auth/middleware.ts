import { type Context, type Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { validateSession } from './session';
import { SESSION_COOKIE_NAME } from './cookie';

export const getAuth = async (c: Context) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return { session: null, user: null };
  }

  return validateSession(sessionToken);
};

export const requireAuth = async (c: Context, next: Next) => {
  const { session, user } = await getAuth(c);

  if (!session || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', user);
  await next();
};

import { type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

export const SESSION_COOKIE_NAME = 'session';

export const setSessionCookie = (
  c: Context,
  sessionToken: string,
  expiresAt: Date
) => {
  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
  });
};

export const deleteSessionCookie = (c: Context) => {
  deleteCookie(c, SESSION_COOKIE_NAME);
};

import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';

import { eq } from 'drizzle-orm';
import { db } from '../db';
import { session } from '../db/schema/session';

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2; // 30 days

export const generateRandomSessionToken = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
};

const fromSessionTokenToSessionId = (sessionToken: string) => {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
};

export const createSession = async (sessionToken: string, userId: number) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  const [newSession] = await db
    .insert(session)
    .values({
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
    })
    .returning();

  return newSession;
};

export const validateSession = async (sessionToken: string) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  const result = await db.query.session.findFirst({
    where: eq(session.id, sessionId),
    with: {
      user: true,
    },
  });

  if (!result) {
    return { session: null, user: null };
  }

  const { user: sessionUser, ...sessionData } = result;

  if (Date.now() >= sessionData.expiresAt.getTime()) {
    await db.delete(session).where(eq(session.id, sessionId));
    return { session: null, user: null };
  }

  if (
    Date.now() >=
    sessionData.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS
  ) {
    const newExpiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await db
      .update(session)
      .set({ expiresAt: newExpiresAt })
      .where(eq(session.id, sessionId));
    sessionData.expiresAt = newExpiresAt;
  }

  return { session: sessionData, user: sessionUser };
};

export const invalidateSession = async (sessionId: string) => {
  await db.delete(session).where(eq(session.id, sessionId));
};

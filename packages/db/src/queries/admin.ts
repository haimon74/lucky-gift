import { eq, lt } from 'drizzle-orm';
import { db } from '../client.js';
import { adminSessions } from '../schema.js';

export function createSession(id: string): void {
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000;
  db.insert(adminSessions).values({ id, createdAt: now, expiresAt }).run();
}

export function getSession(id: string): { expiresAt: number } | null {
  const session = db
    .select({ expiresAt: adminSessions.expiresAt })
    .from(adminSessions)
    .where(eq(adminSessions.id, id))
    .get();

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    db.delete(adminSessions).where(eq(adminSessions.id, id)).run();
    return null;
  }

  return { expiresAt: session.expiresAt };
}

export function deleteSession(id: string): void {
  db.delete(adminSessions).where(eq(adminSessions.id, id)).run();
}

export function deleteExpiredSessions(): void {
  db.delete(adminSessions).where(lt(adminSessions.expiresAt, Date.now())).run();
}

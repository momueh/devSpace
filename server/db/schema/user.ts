import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstname: text('firstname').notNull(),
  lastname: text('lastname').notNull(),
  passwordHash: text('passwordHash').notNull(),
  emailNotifications: boolean('email_notifications').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(user, {
  email: z.string().email(),
  firstname: z.string().min(1),
  lastname: z.string().min(2),
  passwordHash: z.string().min(8),
  emailNotifications: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstname: z.string().min(1).optional(),
  lastname: z.string().min(2).optional(),
  passwordHash: z.string().min(8).optional(),
  emailNotifications: z.boolean().optional(),
});

export const selectUserSchema = createSelectSchema(user);

export type User = InferSelectModel<typeof user>;

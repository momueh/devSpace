import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstname: text('firstname').notNull(),
  lastname: text('lastname').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(user, {
  email: z.string().email(),
  firstname: z.string().min(1),
  lastname: z.string().min(2),
  password: z.string().min(6),
});

export const selectUserSchema = createSelectSchema(user);

import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { task } from './task';
import { user } from './user';

export const note = pgTable('note', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  taskId: integer('task_id')
    .notNull()
    .references(() => task.id),
  authorId: integer('author_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertNoteSchema = createInsertSchema(note, {
  content: z.string().min(1),
});

export const selectNoteSchema = createSelectSchema(note);

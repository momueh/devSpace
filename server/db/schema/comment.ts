import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { task } from './task';
import { note } from './note';
import { user } from './user';

export const comment = pgTable('comment', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => user.id),
  taskId: integer('task_id').references(() => task.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comment, {
  content: z.string().min(1),
}).refine((data) => data.taskId, {
  message: 'Comment must be associated with a task',
});

export const selectCommentSchema = createSelectSchema(comment);

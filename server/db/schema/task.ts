import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { project } from './project';
import { user } from './user';
import type { InferSelectModel } from 'drizzle-orm';

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('Backlog'),
  priority: text('priority').notNull().default('medium'),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id),
  assigneeId: integer('assignee_id').references(() => user.id),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertTaskSchema = createInsertSchema(task, {
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  projectId: z.number(),
  dueDate: z.date().optional(),
});

export const selectTaskSchema = createSelectSchema(task);
export type User = InferSelectModel<typeof user>;

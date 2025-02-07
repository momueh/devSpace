import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { project } from './project';
import { user } from './user';
import type { InferSelectModel } from 'drizzle-orm';

export const taskStatusEnum = pgEnum('task_status', [
  'backlog',
  'in_progress',
  'in_review',
  'done',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const taskSizeEnum = pgEnum('task_size', ['s', 'm', 'l', 'xl']);

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('backlog'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  size: taskSizeEnum('size').notNull().default('m'),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id),
  assigneeId: integer('assignee_id').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertTaskSchema = createInsertSchema(task, {
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['backlog', 'in_progress', 'in_review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  size: z.enum(['s', 'm', 'l', 'xl']),
  projectId: z.number(),
});

export const selectTaskSchema = createSelectSchema(task);
export type User = InferSelectModel<typeof user>;

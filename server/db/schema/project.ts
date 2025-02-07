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
import { user } from './user';

export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'archived',
  'completed',
]);

export const project = pgTable('project', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: integer('owner_id').references(() => user.id),
  status: projectStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProjectSchema = createInsertSchema(project, {
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'completed']),
});

export const selectProjectSchema = createSelectSchema(project);

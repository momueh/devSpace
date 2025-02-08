import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { project } from './project';

export const resourceVisibilityEnum = pgEnum('resource_visibility', [
  'private',
  'team',
  'public',
]);

export const projectResource = pgTable('project_resource', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id),
  title: text('title').notNull(),
  url: text('url').notNull(),
  visibility: resourceVisibilityEnum('visibility').notNull().default('private'),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProjectResourceSchema = createInsertSchema(projectResource, {
  title: z.string().min(1),
  url: z.string().url(),
  visibility: z.enum(['private', 'team', 'public']),
  isPinned: z.boolean(),
});

export const selectProjectResourceSchema = createSelectSchema(projectResource);

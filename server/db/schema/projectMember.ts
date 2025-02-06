import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './user';
import { project } from './project';

export const ProjectRole = {
  OWNER: 'owner',
  DEVELOPER: 'developer',
  CLIENT: 'client',
} as const;

export const projectMember = pgTable('project_member', {
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id),
  role: text('role').notNull().default(ProjectRole.DEVELOPER),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProjectMemberSchema = createInsertSchema(projectMember, {
  role: z.enum([ProjectRole.OWNER, ProjectRole.DEVELOPER, ProjectRole.CLIENT]),
});

export const selectProjectMemberSchema = createSelectSchema(projectMember);

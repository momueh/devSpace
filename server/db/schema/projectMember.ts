import { pgTable, integer, text, timestamp, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './user';
import { project } from './project';
import { projectRole } from './projectRole';

export const ProjectRole = {
  OWNER: 'owner',
  DEVELOPER: 'developer',
  CLIENT: 'client',
} as const;

export const projectMember = pgTable('project_member', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id),
  roleId: integer('role_id')
    .notNull()
    .references(() => projectRole.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProjectMemberSchema = createInsertSchema(projectMember, {
  userId: z.number(),
  projectId: z.number(),
  roleId: z.number(),
});

export const selectProjectMemberSchema = createSelectSchema(projectMember);

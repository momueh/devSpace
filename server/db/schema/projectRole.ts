import { pgTable, text, serial, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Define the base project roles
export const ProjectRoleType = {
  OWNER: 'owner',
  DEVELOPER: 'developer',
  CLIENT: 'client',
} as const;

export type ProjectRoleType =
  (typeof ProjectRoleType)[keyof typeof ProjectRoleType];

export const projectRole = pgTable('project_role', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  inheritsFrom: integer('inherits_from').references((): any => projectRole.id),
});

export const insertProjectRoleSchema = createInsertSchema(projectRole);
export const selectProjectRoleSchema = createSelectSchema(projectRole);

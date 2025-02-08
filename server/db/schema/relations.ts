import { relations } from 'drizzle-orm';
import { user } from './user';
import { project } from './project';
import { task } from './task';
import { note } from './note';
import { comment } from './comment';
import { session } from './session';
import { projectMember } from './projectMember';
import { projectRolePermission } from './projectRolePermission';
import { projectRole } from './projectRole';
import { permission } from './permission';

export const userRelations = relations(user, ({ many }) => ({
  ownedProjects: many(project),
  projectMemberships: many(projectMember),
  assignedTasks: many(task, { relationName: 'assignee' }),
  notes: many(note),
  comments: many(comment),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  owner: one(user, {
    fields: [project.ownerId],
    references: [user.id],
  }),
  tasks: many(task),
  members: many(projectMember),
}));

export const taskRelations = relations(task, ({ one, many }) => ({
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
  assignee: one(user, {
    fields: [task.assigneeId],
    references: [user.id],
  }),
  notes: many(note),
  comments: many(comment),
}));

export const noteRelations = relations(note, ({ one, many }) => ({
  task: one(task, {
    fields: [note.taskId],
    references: [task.id],
  }),
  author: one(user, {
    fields: [note.authorId],
    references: [user.id],
  }),
  comments: many(comment),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  author: one(user, {
    fields: [comment.authorId],
    references: [user.id],
  }),
  task: one(task, {
    fields: [comment.taskId],
    references: [task.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const projectRoleRelations = relations(projectRole, ({ one, many }) => ({
  inheritsFromRole: one(projectRole, {
    fields: [projectRole.inheritsFrom],
    references: [projectRole.id],
  }),
  permissions: many(projectRolePermission),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  roles: many(projectRolePermission),
}));

export const projectRolePermissionRelations = relations(
  projectRolePermission,
  ({ one }) => ({
    role: one(projectRole, {
      fields: [projectRolePermission.roleId],
      references: [projectRole.id],
    }),
    permission: one(permission, {
      fields: [projectRolePermission.permissionId],
      references: [permission.id],
    }),
  })
);

export const projectMemberRelations = relations(projectMember, ({ one }) => ({
  user: one(user, {
    fields: [projectMember.userId],
    references: [user.id],
  }),
  project: one(project, {
    fields: [projectMember.projectId],
    references: [project.id],
  }),
  role: one(projectRole, {
    fields: [projectMember.roleId],
    references: [projectRole.id],
  }),
}));

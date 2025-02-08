import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core';
import { projectRole } from './projectRole';
import { permission } from './permission';

export const projectRolePermission = pgTable(
  'project_role_permission',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => projectRole.id),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permission.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);

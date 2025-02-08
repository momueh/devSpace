import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  commentRelations,
  noteRelations,
  permissionRelations,
  projectMemberRelations,
  projectRelations,
  projectRolePermissionRelations,
  projectRoleRelations,
  sessionRelations,
  taskRelations,
  userRelations,
} from './schema/relations';
import { user } from './schema/user';
import { note } from './schema/note';
import { comment } from './schema/comment';
import { task } from './schema/task';
import { project } from './schema/project';
import { session } from './schema/session';
import { projectMember } from './schema/projectMember';
import { permission } from './schema/permission';
import { projectRolePermission } from './schema/projectRolePermission';
import { projectRole } from './schema/projectRole';

// combine all schemas into one object
const schema = {
  // tables
  user,
  project,
  projectMember,
  projectRole,
  permission,
  projectRolePermission,
  task,
  note,
  comment,
  session,
  // relations
  userRelations,
  projectRelations,
  projectMemberRelations,
  projectRoleRelations,
  permissionRelations,
  projectRolePermissionRelations,
  taskRelations,
  noteRelations,
  commentRelations,
  sessionRelations,
};

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// for query purposes
const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });

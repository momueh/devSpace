import { db } from '../db';
import { and, eq } from 'drizzle-orm';
import { projectMember } from '../db/schema/projectMember';
import { type ProjectPermissions } from '../sharedTypes';

// Define known permissions as constants
export const Permissions = {
  // Project Management
  CREATE_PROJECT: 'create_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  INVITE_TO_PROJECT: 'invite_to_project',

  // Task Management
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task',
  ASSIGN_TASK: 'assign_task',

  // Resource Management
  CREATE_RESOURCE: 'create_resource',
  DELETE_RESOURCE: 'delete_resource',

  // Comments & Notes
  CREATE_COMMENT: 'create_comment',
  EDIT_COMMENT: 'edit_comment',
  DELETE_COMMENT: 'delete_comment',

  // Task Notes
  VIEW_NOTE: 'view_note',
  CREATE_NOTE: 'create_note',
  EDIT_NOTE: 'edit_note',
  DELETE_NOTE: 'delete_note',

  // Developer Features
  VIEW_OWN_DEV_SPACE: 'view_own_dev_space',
} as const;

export async function getUserProjectPermissions(
  userId: number
): Promise<Record<number, ProjectPermissions>> {
  const memberships = await db.query.projectMember.findMany({
    where: eq(projectMember.userId, userId),
    with: {
      project: true,
      role: {
        with: {
          permissions: {
            with: {
              permission: true,
            },
          },
          inheritsFromRole: {
            with: {
              permissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const projectPermissions: Record<number, ProjectPermissions> = {};

  for (const membership of memberships) {
    const permissions = new Set<string>();

    // Add direct role permissions
    membership.role.permissions.forEach((rp) =>
      permissions.add(rp.permission.name)
    );

    // Add inherited permissions if any
    if (membership.role.inheritsFromRole) {
      membership.role.inheritsFromRole.permissions.forEach((rp) =>
        permissions.add(rp.permission.name)
      );
    }

    projectPermissions[membership.projectId] = Object.values(
      Permissions
    ).reduce(
      (acc, permission) => ({
        ...acc,
        [permission]: permissions.has(permission),
      }),
      {} as ProjectPermissions
    );
  }

  return projectPermissions;
}

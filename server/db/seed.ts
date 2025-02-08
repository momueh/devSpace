import postgres from 'postgres';
import { db } from '.';
import { Permissions } from '../sharedTypes';
import { permission } from './schema/permission';
import { projectRole, ProjectRoleType } from './schema/projectRole';
import { projectRolePermission } from './schema/projectRolePermission';
import { drizzle } from 'drizzle-orm/postgres-js';

const seedClient = postgres(process.env.DATABASE_URL!, { max: 1 });

async function seed() {
  const db = drizzle(seedClient);
  try {
    await seedPermissions();
    console.log('✅ Seed complete');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await seedClient.end();
  }
}

export async function seedPermissions() {
  // First, create all permissions

  const permissionEntries = Object.values(Permissions).map((name) => ({
    name,
  }));
  const createdPermissions = await db
    .insert(permission)
    .values(permissionEntries)
    .returning();

  // Create the developer role first (since owner inherits from it)
  const [developerRole] = await db
    .insert(projectRole)
    .values({
      name: ProjectRoleType.DEVELOPER,
      description: 'Can manage tasks and access development features',
    })
    .returning();

  // Create owner role that inherits from developer
  const [ownerRole] = await db
    .insert(projectRole)
    .values({
      name: ProjectRoleType.OWNER,
      description: 'Full project management capabilities',
      inheritsFrom: developerRole.id,
    })
    .returning();

  // Create client role (no inheritance)
  const [clientRole] = await db
    .insert(projectRole)
    .values({
      name: ProjectRoleType.CLIENT,
      description: 'Can view and comment on tasks',
    })
    .returning();

  // Helper to find permission ID by name
  const getPermissionId = (name: string): number => {
    const id = createdPermissions.find((p) => p.name === name)?.id;
    if (!id) throw new Error(`Permission ${name} not found`);
    return id;
  };

  // Assign developer permissions
  await db.insert(projectRolePermission).values([
    {
      roleId: developerRole.id,
      permissionId: getPermissionId(Permissions.CREATE_TASK),
    },
    {
      roleId: developerRole.id,
      permissionId: getPermissionId(Permissions.EDIT_TASK),
    },
    {
      roleId: developerRole.id,
      permissionId: getPermissionId(Permissions.ASSIGN_TASK),
    },
    {
      roleId: developerRole.id,
      permissionId: getPermissionId(Permissions.VIEW_NOTE),
    },
    {
      roleId: developerRole.id,
      permissionId: getPermissionId(Permissions.CREATE_NOTE),
    },
    {
      roleId: developerRole.id,
      permissionId: getPermissionId(Permissions.EDIT_NOTE),
    },
    {
      roleId: developerRole.id,
      permissionId: getPermissionId(Permissions.VIEW_OWN_DEV_SPACE),
    },
  ]);

  // Assign owner-specific permissions (these stack with inherited developer permissions)
  await db.insert(projectRolePermission).values([
    {
      roleId: ownerRole.id,
      permissionId: getPermissionId(Permissions.CREATE_PROJECT),
    },
    {
      roleId: ownerRole.id,
      permissionId: getPermissionId(Permissions.EDIT_PROJECT),
    },
    {
      roleId: ownerRole.id,
      permissionId: getPermissionId(Permissions.DELETE_PROJECT),
    },
    {
      roleId: ownerRole.id,
      permissionId: getPermissionId(Permissions.INVITE_TO_PROJECT),
    },
  ]);

  // Assign client permissions
  await db.insert(projectRolePermission).values([
    {
      roleId: clientRole.id,
      permissionId: getPermissionId(Permissions.CREATE_COMMENT),
    },
    {
      roleId: clientRole.id,
      permissionId: getPermissionId(Permissions.EDIT_COMMENT),
    },
  ]);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

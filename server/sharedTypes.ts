import type { projectStatusEnum } from './db/schema/project';
import type {
  taskPriorityEnum,
  taskSizeEnum,
  taskStatusEnum,
} from './db/schema/task';
import type { User } from './db/schema/user';

export type TaskStatus = (typeof taskStatusEnum.enumValues)[number];
export type TaskPriority = (typeof taskPriorityEnum.enumValues)[number];
export type TaskSize = (typeof taskSizeEnum.enumValues)[number];
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  size: TaskSize;
  projectId: number;
  assigneeId?: number;
  createdAt: Date;
  updatedAt: Date;
  assignee?: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  status: 'active' | 'archived' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
  members?: Array<{
    user: {
      id: number;
      firstname: string;
      lastname: string;
      email: string;
    };
    role: string;
  }>;
}

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

export type Permission = (typeof Permissions)[keyof typeof Permissions];
export interface ProjectPermissions {
  manage_project: boolean;
  manage_team: boolean;
  view_billing: boolean;
  create_task: boolean;
  edit_task: boolean;
  delete_task: boolean;
  assign_task: boolean;
  view_tasks: boolean;
  create_comment: boolean;
  manage_comments: boolean;
  manage_notes: boolean;
  access_dev_space: boolean;
  view_metrics: boolean;
}
export interface AuthenticatedUser extends User {
  projectPermissions: Record<number, ProjectPermissions>;
}

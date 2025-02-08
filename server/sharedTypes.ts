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
  resources?: ResourceLink[];
}

export type Permission = (typeof Permissions)[keyof typeof Permissions];
export interface ProjectPermissions {
  create_project: boolean;
  edit_project: boolean;
  delete_project: boolean;
  invite_to_project: boolean;

  create_task: boolean;
  edit_task: boolean;
  delete_task: boolean;
  assign_task: boolean;

  create_comment: boolean;
  edit_comment: boolean;
  delete_comment: boolean;

  view_note: boolean;
  create_note: boolean;
  edit_note: boolean;
  delete_note: boolean;

  view_own_dev_space: boolean;
}
export interface AuthenticatedUser extends User {
  projectPermissions: Record<number, ProjectPermissions>;
}

export type ResourceVisibility = 'private' | 'team' | 'public';
export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  visibility: ResourceVisibility;
  isPinned: boolean;
}

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

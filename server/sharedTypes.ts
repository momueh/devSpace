import type { projectStatusEnum } from './db/schema/project';
import type {
  taskPriorityEnum,
  taskSizeEnum,
  taskStatusEnum,
} from './db/schema/task';

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

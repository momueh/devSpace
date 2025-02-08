import { TaskPriority, TaskSize, TaskStatus } from '@server/sharedTypes';

export const TaskStatusDisplay: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
} as const;

// Helper functions to get display values
export function getStatusDisplay(status: TaskStatus): string {
  return TaskStatusDisplay[status];
}

export function getPriorityDisplay(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getSizeDisplay(size: TaskSize): string {
  return size.toUpperCase();
}

// Column order for the board
export const BOARD_COLUMNS: TaskStatus[] = [
  'backlog',
  'in_progress',
  'in_review',
  'done',
];

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
} as const;

export const SIZE_ORDER: Record<TaskSize, number> = {
  s: 0,
  m: 1,
  l: 2,
  xl: 3,
} as const;

export const STATUS_ORDER: Record<TaskStatus, number> = {
  backlog: 0,
  in_progress: 1,
  in_review: 2,
  done: 3,
} as const;

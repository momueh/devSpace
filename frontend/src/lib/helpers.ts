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
  return priority.toUpperCase();
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

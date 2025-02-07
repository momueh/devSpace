import { hc } from 'hono/client';
import { type ApiRoutes } from '@server/app';
import { queryOptions } from '@tanstack/react-query';
import { User } from '@server/db/schema/user';
import { Task } from '@server/sharedTypes';

const client = hc<ApiRoutes>('/');

export const api = client.api;

async function getCurrentUser() {
  const res = await api.auth.me.$get();
  if (!res.ok) {
    throw new Error('server error');
  }
  const data = await res.json();
  return data;
}

export const userQueryOptions = queryOptions({
  queryKey: ['get-current-user'],
  queryFn: getCurrentUser,
  staleTime: Infinity,
});

export const getUserProjectsQueryOptions = () => ({
  queryKey: ['projects'],
  queryFn: async () => {
    const res = await api.project.$get();
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },
});

export async function getProject(projectId: number) {
  const res = await api.project[':id'].$get({
    param: { id: projectId.toString() },
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export const getProjectQueryOptions = (projectId: number) =>
  queryOptions({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    staleTime: Infinity,
  });

export async function createTask(projectId: number, task: Partial<Task>) {
  const res = await api.task.$post({
    json: {
      ...task,
      projectId, // task is always created in a project
    },
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(taskId: number, task: Partial<Task>) {
  const res = await api.task[':id'].$patch({
    param: { id: taskId.toString() },
    json: task,
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(taskId: number) {
  const res = await api.task[':id'].$delete({
    param: { id: taskId.toString() },
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export const updateUser = async (userId: number, data: Partial<User>) => {
  const res = await api.user[':id'].$patch({
    param: { id: userId.toString() },
    json: data,
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};

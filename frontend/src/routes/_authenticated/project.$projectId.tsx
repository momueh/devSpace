import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { Edit, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { Input } from '@/components/ui/input';

import { toast } from 'sonner';
import {
  createTask,
  deleteTask,
  getProjectQueryOptions,
  updateTask,
} from '@/lib/api';
import { EditProjectModal } from '@/components/Modals/EditProjectModal';
import { TaskDetailModal } from '@/components/Modals/TaskDetailModal';
import { ManageTeamModal } from '@/components/Modals/ManageTeamModal';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';
import { Task, TaskStatus } from '@server/sharedTypes';
import { BOARD_COLUMNS, getStatusDisplay } from '@/lib/helpers';

export const Route = createFileRoute('/_authenticated/project/$projectId')({
  loader: ({ context: { queryClient }, params: { projectId } }) =>
    queryClient.ensureQueryData(getProjectQueryOptions(Number(projectId))),
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const queryClient = Route.useRouteContext().queryClient;

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isManageTeamModalOpen, setIsManageTeamModalOpen] = useState(false);

  const {
    data: project,
    isLoading,
    isError,
  } = useSuspenseQuery(getProjectQueryOptions(Number(projectId)));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>Error loading project</div>;
  }

  console.log(project);

  const columns = BOARD_COLUMNS;

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      await createTask(Number(projectId), {
        title: newTaskTitle,
        status: 'backlog',
      });

      queryClient.invalidateQueries({
        queryKey: ['project', Number(projectId)],
      });
      setNewTaskTitle('');
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    queryClient.invalidateQueries({ queryKey: ['project', Number(projectId)] });
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
    queryClient.invalidateQueries({
      queryKey: ['project', Number(projectId)],
    });
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    try {
      const taskId = Number(result.draggableId);
      await handleUpdateTask(taskId, {
        status: result.destination.droppableId,
      });
      toast.success(`Task moved to ${result.destination.droppableId}`);
    } catch (error) {
      toast.error('Failed to move task');
    }
  };

  return (
    <div className='flex flex-col h-[calc(100vh-4rem)]'>
      <div className='flex items-center justify-between p-6'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>{project.name}</h1>
          {project.description && (
            <p className='text-muted-foreground'>{project.description}</p>
          )}
        </div>
        <div className='space-x-4'>
          <Button onClick={() => setIsEditProjectModalOpen(true)}>
            <Edit className='h-4 w-4 mr-2' />
            Manage Project
          </Button>
          <Button onClick={() => setIsManageTeamModalOpen(true)}>
            <Users className='h-4 w-4 mr-2' />
            Manage Team
          </Button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        <div className='p-6 py-8'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTask();
            }}
            className='flex gap-2 items-center max-w-md'
          >
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder='Add new task ...'
            />
            <Button type='submit' size='icon'>
              <Plus className='h-4 w-4' />
            </Button>
          </form>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className='grid grid-cols-4 gap-4 p-6 pt-0 h-[calc(100%-80px)]'>
            {columns.map((column) => (
              <div key={column} className='flex flex-col h-full'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='font-semibold capitalize'>
                    {getStatusDisplay(column)}
                  </h2>
                  <Badge
                    variant='secondary'
                    className={cn(
                      column === 'backlog' && 'bg-slate-100 text-slate-700',
                      column === 'in_progress' && 'bg-amber-100 text-amber-700',
                      column === 'in_review' && 'bg-purple-100 text-purple-700',
                      column === 'done' && 'bg-green-100 text-green-700'
                    )}
                  >
                    {
                      project.tasks.filter((task) => task.status === column)
                        .length
                    }
                  </Badge>
                </div>
                <Droppable droppableId={column}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 space-y-2 p-2 rounded-lg overflow-y-auto',
                        column === 'backlog' && 'bg-slate-50',
                        column === 'in_progress' && 'bg-amber-50',
                        column === 'in_review' && 'bg-purple-50',
                        column === 'done' && 'bg-green-50'
                      )}
                    >
                      {project.tasks
                        .filter((task) => task.status === column)
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <TaskCard
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                ref={provided.innerRef}
                                draggableProps={provided.draggableProps}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={project}
      />
      <ManageTeamModal
        isOpen={isManageTeamModalOpen}
        onClose={() => setIsManageTeamModalOpen(false)}
        projectId={Number(projectId)}
        members={project.members}
      />
    </div>
  );
}

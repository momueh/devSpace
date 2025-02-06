import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { Edit } from 'lucide-react';
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
import { ProjectModal } from '@/components/Modals/ProjectModal';
import { TaskDetailModal } from '@/components/Modals/TaskDetailModal';

export const Route = createFileRoute('/_authenticated/project/$projectId')({
  loader: ({ context: { queryClient }, params: { projectId } }) =>
    queryClient.ensureQueryData(getProjectQueryOptions(Number(projectId))),
  component: ProjectPage,
});

type TaskStatus = 'Backlog' | 'In Progress' | 'In Review' | 'Done';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

function ProjectPage() {
  const { projectId } = Route.useParams();
  const queryClient = Route.useRouteContext().queryClient;

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const columns: TaskStatus[] = ['Backlog', 'In Progress', 'In Review', 'Done'];

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      await createTask(Number(projectId), {
        title: newTaskTitle,
        status: 'todo',
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
        <h1 className='text-3xl font-bold tracking-tight'>
          Project #{projectId}
        </h1>
        <Button onClick={() => setIsProjectModalOpen(true)}>
          <Edit className='h-4 w-4 mr-2' />
          Manage Project
        </Button>
      </div>

      <div className='pt-20 flex-1'>
        <div className='p-6 pt-0'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTask();
            }}
          >
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder='Add new task ...'
              className='max-w-md'
            />
          </form>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className='grid grid-cols-4 gap-4 p-6 pt-0'>
            {columns.map((column) => (
              <div key={column} className='flex flex-col h-full'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='font-semibold capitalize'>{column}</h2>
                  <Badge variant='secondary'>
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
                      className='flex-1 space-y-2 p-2 min-h-[200px] bg-muted/50 rounded-lg overflow-y-auto'
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
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='cursor-grab active:cursor-grabbing'
                                onClick={() => setSelectedTask(task)}
                              >
                                <CardContent className='p-4'>
                                  <div className='flex justify-between items-center'>
                                    <p>{task.title}</p>
                                    <Badge
                                      variant={
                                        task.priority === 'high'
                                          ? 'destructive'
                                          : task.priority === 'medium'
                                            ? 'secondary'
                                            : 'outline'
                                      }
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
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

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={project}
      />
    </div>
  );
}

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
import { getProjectQueryOptions } from '@/lib/api';
import { ProjectModal } from '@/components/Modals/ProjectModal';

export const Route = createFileRoute('/_authenticated/project/$projectId')({
  loader: ({ context: { queryClient }, params: { projectId } }) =>
    queryClient.ensureQueryData(getProjectQueryOptions(projectId)),
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

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Implement authentication', status: 'In Progress' },
    { id: '2', title: 'Set up database', status: 'Done' },
    { id: '3', title: 'Design UI mockups', status: 'Backlog' },
    { id: '4', title: 'Write documentation', status: 'In Review' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const {
    data: project,
    isLoading,
    isError,
  } = useSuspenseQuery(getProjectQueryOptions(projectId));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>Error loading project</div>;
  }

  console.log(project);

  const columns: TaskStatus[] = ['Backlog', 'In Progress', 'In Review', 'Done'];

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    reorderedItem.status = result.destination.droppableId as TaskStatus;
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
    toast(`Task moved to ${result.destination.droppableId}`);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'Backlog',
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    toast.success('Task created successfully');
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
                  <h2 className='font-semibold'>{column}</h2>
                  <Badge variant='secondary'>
                    {tasks.filter((task) => task.status === column).length}
                  </Badge>
                </div>
                <Droppable droppableId={column}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className='flex-1 space-y-2 p-2 min-h-[200px] bg-muted/50 rounded-lg overflow-y-auto'
                    >
                      {tasks
                        .filter((task) => task.status === column)
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='cursor-grab active:cursor-grabbing'
                              >
                                <CardContent className='p-4'>
                                  <p>{task.title}</p>
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

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={project}
      />
    </div>
  );
}

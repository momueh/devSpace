import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Edit, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
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
import { Task } from '@server/sharedTypes';
import {
  BOARD_COLUMNS,
  getStatusDisplay,
  getUserProjectPermissions,
} from '@/lib/helpers';
import ProjectKnowledge from '@/components/ProjectKnowledge';
import { AddResourceModal } from '@/components/Modals/AddResourceModal';

export const Route = createFileRoute('/_authenticated/project/$projectId')({
  loader: ({ context: { queryClient }, params: { projectId } }) =>
    queryClient.ensureQueryData(getProjectQueryOptions(Number(projectId))),
  component: ProjectPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      taskId: search.taskId ? Number(search.taskId) : undefined,
    };
  },
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { taskId } = Route.useSearch();
  const queryClient = Route.useRouteContext().queryClient;
  const { user } = Route.useRouteContext();
  const userProjectPermissions = getUserProjectPermissions(
    user?.projectPermissions,
    Number(projectId)
  );
  console.log(userProjectPermissions);

  const canCreateTask = userProjectPermissions['create_task'] === true;
  const canEditTask = userProjectPermissions['edit_task'] === true;
  const canDeleteTask = userProjectPermissions['delete_task'] === true;
  const canEditProject = userProjectPermissions['edit_project'] === true;
  const canInviteToProject =
    userProjectPermissions['invite_to_project'] === true;
  const canCreateResource = userProjectPermissions['create_resource'] === true;
  const canDeleteResource = userProjectPermissions['delete_resource'] === true;
  const canViewNote = userProjectPermissions['view_note'] === true;
  const canCreateComment = userProjectPermissions['create_comment'] === true;

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isManageTeamModalOpen, setIsManageTeamModalOpen] = useState(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);

  const {
    data: project,
    isLoading,
    isError,
  } = useSuspenseQuery(getProjectQueryOptions(Number(projectId)));

  useEffect(() => {
    if (taskId && project.tasks) {
      const task = project.tasks.find((t) => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [taskId, project.tasks]);

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
        size: 'm',
        priority: 'medium',
      });

      queryClient.invalidateQueries({
        queryKey: ['project', Number(projectId)],
      });
      setNewTaskTitle('');
      toast.success('Task created successfully');
    } catch {
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
    } catch {
      toast.error('Failed to move task');
    }
  };

  return (
    <div className='flex flex-col h-[calc(100vh-105px)]'>
      <div className='flex items-center justify-between p-4'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>{project.name}</h1>
          {project.description && (
            <p className='text-muted-foreground'>{project.description}</p>
          )}
        </div>
        <div className='space-x-4'>
          {canEditProject && (
            <Button onClick={() => setIsEditProjectModalOpen(true)}>
              <Edit className='h-4 w-4 mr-2' />
              Manage Project
            </Button>
          )}
          {canInviteToProject && (
            <Button onClick={() => setIsManageTeamModalOpen(true)}>
              <Users className='h-4 w-4 mr-2' />
              Manage Team
            </Button>
          )}
        </div>
      </div>

      <ProjectKnowledge
        projectId={Number(projectId)}
        resources={project.resources}
        canCreate={canCreateResource}
        canDelete={canDeleteResource}
        setIsAddResourceModalOpen={setIsAddResourceModalOpen}
      />

      <h2 className='px-4 py-6 text-lg font-semibold'>Kanban</h2>
      <div className='flex-1 overflow-hidden'>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='grid grid-cols-4 gap-4 p-4 pt-0 h-[calc(100%-80px)]'>
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

        {canCreateTask && (
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
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectMembers={project.members}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          canEdit={canEditTask}
          canDelete={canDeleteTask}
          canViewNote={canViewNote}
          canCreateComment={canCreateComment}
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
      <AddResourceModal
        isOpen={isAddResourceModalOpen}
        onClose={() => setIsAddResourceModalOpen(false)}
        projectId={Number(projectId)}
      />
    </div>
  );
}

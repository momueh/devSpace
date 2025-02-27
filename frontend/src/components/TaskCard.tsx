import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Task } from '@server/sharedTypes';
import { getInitials, getPriorityDisplay, getSizeDisplay } from '@/lib/helpers';
import { forwardRef } from 'react';
import {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  draggableProps: DraggableProvidedDraggableProps;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onClick, dragHandleProps, draggableProps }, ref) => (
    <div ref={ref} {...draggableProps}>
      <Card
        {...dragHandleProps}
        className='cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow'
        onClick={onClick}
      >
        <CardContent className='p-2 space-y-3'>
          <div className='flex justify-between items-start'>
            <div className='space-y-2 flex-1'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  #{task.id}
                </span>
                <p className='text-lg'>{task.title}</p>
              </div>
              <div className='flex items-center gap-2'>
                {task.priority && (
                  <Badge variant='secondary' className='shrink-0'>
                    {getPriorityDisplay(task.priority)}
                  </Badge>
                )}
                {task.size && (
                  <Badge variant='secondary' className='shrink-0'>
                    {getSizeDisplay(task.size)}
                  </Badge>
                )}
              </div>
            </div>
            {task.assignee && (
              <Avatar className='h-7 w-7 shrink-0'>
                <AvatarFallback className='text-xs bg-primary/10'>
                  {getInitials(task.assignee.firstname, task.assignee.lastname)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
);

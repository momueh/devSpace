import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import MDEditor from '@uiw/react-md-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Task, TaskPriority, TaskSize, TaskStatus } from '@server/sharedTypes';
import { BOARD_COLUMNS, TaskStatusDisplay } from '@/lib/helpers';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  EyeOff,
  FileLock,
  MessageSquare,
  Plus,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectMembers: any;
  onUpdate: (taskId: number, task: Partial<Task>) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectMembers,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDevNotesOpen, setIsDevNotesOpen] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [size, setSize] = useState<TaskSize>(task.size);
  const [devNote, setDevNote] = useState(task.devNote || '');
  const [newNote, setNewNote] = useState('');

  console.log('projectMembers', projectMembers);

  // Add these handlers
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`/api/task/${task.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote,
        }),
      });

      if (!response.ok) throw new Error('Failed to add note');

      queryClient.invalidateQueries(['project', task.projectId]);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/task/${task.id}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      queryClient.invalidateQueries(['project', task.projectId]);
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description,
      status,
      priority,
      devNote,
      isDevNotePublic,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
    toast({
      title: 'Task updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  const handleDelete = () => {
    if (!isDeletingTask) {
      setIsDeletingTask(true);
      return;
    }
    onDelete(task.id);
    onClose();
    toast({
      title: 'Task deleted',
      description: 'The task has been permanently removed.',
      variant: 'destructive',
    });
  };

  const commentCount = task.comments?.length || 0;

  const editorStyles = {
    minHeight: '300px',
    width: '100%',
  } as const;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className='max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='grid grid-cols-[1fr,200px] gap-6 pt-4'>
          <div className='space-y-6'>
            <DialogHeader>
              <div className='flex items-center justify-between'>
                {isEditing ? (
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='text-xl font-semibold w-full bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 transition-colors duration-200'
                    placeholder='Task title'
                  />
                ) : (
                  <h2 className='text-xl font-semibold'>{title}</h2>
                )}
              </div>
            </DialogHeader>

            <div className='prose max-w-none dark:prose-invert'>
              {isEditing ? (
                <MDEditor
                  value={description}
                  onChange={(value) => setDescription(value || '')}
                  preview='edit'
                  className='border border-gray-200 rounded-md min-h-[300px]'
                  textareaProps={{
                    placeholder:
                      'Describe your task here...\n\n' +
                      '# You can use Markdown!\n' +
                      '- Make lists\n' +
                      '- Add **bold** or *italic* text\n' +
                      '- And more...',
                  }}
                  height={300}
                  style={editorStyles}
                />
              ) : description ? (
                <MDEditor.Markdown
                  source={description}
                  style={{ minHeight: '300px' }}
                />
              ) : (
                <div className='text-muted-foreground italic min-h-[300px] flex items-center justify-center border-2 border-gray-200 rounded-md'>
                  Edit this task to add a description.
                </div>
              )}
            </div>

            <Collapsible
              open={isDevNotesOpen}
              onOpenChange={setIsDevNotesOpen}
              className='border rounded-lg bg-muted/30 overflow-hidden'
            >
              <CollapsibleTrigger className='flex items-center justify-between w-full p-4 hover:bg-muted/50'>
                <div className='flex items-center gap-2'>
                  <FileLock className='h-6 w-6' />
                  <h3 className='text-sm font-medium'>Private Notes</h3>
                  <div className='flex items-center gap-2'>
                    {task.author && (
                      <Avatar className='h-6 w-6'>
                        <AvatarImage src={task.author.avatarUrl} />
                        <AvatarFallback>{task.author.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
                {isDevNotesOpen ? (
                  <ChevronUp className='h-4 w-4' />
                ) : (
                  <ChevronDown className='h-4 w-4' />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='p-4 pt-0 space-y-4'>
                  <Textarea
                    value={devNote}
                    onChange={(e) => setDevNote(e.target.value)}
                    placeholder='You can write private notes here, that are only visible to you.'
                    className='min-h-[100px] resize-none bg-background/50'
                    disabled={!isEditing}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <MessageSquare className='h-4 w-4' />
                <h3 className='text-lg font-semibold'>Comments</h3>
                {commentCount > 0 && (
                  <Badge variant='secondary' className='rounded-full'>
                    {commentCount}
                  </Badge>
                )}
              </div>
              <div className='space-y-4'>
                {task.comments?.map((comment, index) => (
                  <React.Fragment key={comment.id}>
                    <div className='p-4 rounded-lg border bg-card'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Avatar className='h-6 w-6'>
                          <AvatarFallback>
                            {comment.authorName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-medium'>
                          {comment.authorName}
                        </span>
                        <span className='text-sm text-muted-foreground'>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className='text-sm'>{comment.content}</p>
                    </div>
                    {index < task.comments.length - 1 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full h-8 hover:bg-muted/50'
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    )}
                  </React.Fragment>
                ))}
                {(!task.comments || task.comments.length === 0) && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full h-8 hover:bg-muted/50'
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <Button
              variant='outline'
              size='sm'
              className='w-full justify-start'
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className='mr-2 h-4 w-4' />
              {isEditing ? 'Cancel Editing' : 'Edit Task'}
            </Button>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <User className='h-4 w-4' />
                  Assignee
                </div>
                <div className='flex items-center gap-2'>
                  <Select
                    value={task.assigneeId?.toString() || 'unassigned'}
                    onValueChange={(value) =>
                      onUpdate(task.id, {
                        assigneeId:
                          value === 'unassigned' ? null : Number(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Unassigned' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='unassigned'>Unassigned</SelectItem>
                      {projectMembers.map((member) => (
                        <SelectItem
                          key={member.userId}
                          value={member.userId.toString()}
                        >
                          {member.user.firstname} {member.user.lastname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <AlertCircle className='h-4 w-4' />
                  Status
                </div>
                <Select
                  value={status}
                  onValueChange={(value: TaskStatus) => setStatus(value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARD_COLUMNS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {TaskStatusDisplay[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Tag className='h-4 w-4' />
                  Priority
                </div>
                <Select
                  value={priority}
                  onValueChange={(value: TaskPriority) => setPriority(value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>Low</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='critical'>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Tag className='h-4 w-4' />
                  Size
                </div>
                <Select
                  value={size}
                  onValueChange={(value: TaskSize) => setSize(value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Size' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='s'>Small</SelectItem>
                    <SelectItem value='m'>Medium</SelectItem>
                    <SelectItem value='l'>Large</SelectItem>
                    <SelectItem value='xl'>Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='pt-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground mb-2'>
                  <Clock className='h-4 w-4' />
                  Created
                </div>
                <p className='text-sm'>
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>

              <Separator />

              <Button
                variant='destructive'
                size='sm'
                className='w-full justify-start'
                onClick={handleDelete}
              >
                {isDeletingTask ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Confirm Delete
                  </>
                ) : (
                  <>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-6'>
          <Button onClick={handleSave} disabled={!isEditing}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailModal;

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
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Edit,
  FileLock,
  ListOrdered,
  MessageSquare,
  Pencil,
  Plus,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  canEdit: boolean;
  canDelete: boolean;
  canViewNote: boolean;
  canCreateComment: boolean;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectMembers,
  onUpdate,
  onDelete,
  canEdit,
  canDelete,
  canViewNote,
  canCreateComment,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDevNotesOpen, setIsDevNotesOpen] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [size, setSize] = useState<TaskSize>(task.size);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  console.log('task', task);

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`/api/task/${task.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote,
        }),
      });

      if (!response.ok) throw new Error('Failed to create note');

      await onUpdate(task.id, {}); // Refresh task data
      setNewNote('');
      setIsAddingNote(false);
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleEditNote = async (noteId: number) => {
    if (!editedNoteContent.trim()) return;

    try {
      const response = await fetch(`/api/task/${task.id}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedNoteContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to update note');

      await onUpdate(task.id, {}); // Refresh task data
      setEditingNoteId(null);
      setEditedNoteContent('');
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (deletingNoteId !== noteId) {
      setDeletingNoteId(noteId);
      // Reset after 2 seconds if not confirmed
      setTimeout(() => setDeletingNoteId(null), 2000);
      return;
    }

    try {
      const response = await fetch(`/api/task/${task.id}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');

      await onUpdate(task.id, {}); // Refresh task data
      setDeletingNoteId(null);
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
      setDeletingNoteId(null);
    }
  };

  const handleSave = () => {
    onUpdate(task.id, {
      ...task,
      title,
      description,
      status,
      priority,
      //updated_at as timestamp
      updatedAt: new Date().getTime(),
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

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/task/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (!response.ok) throw new Error('Failed to create comment');

      await onUpdate(task.id, {}); // Trigger task refresh
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

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

            {canViewNote && (
              <Collapsible
                open={isDevNotesOpen}
                onOpenChange={setIsDevNotesOpen}
                className='border rounded-lg bg-muted/30 overflow-hidden'
              >
                <CollapsibleTrigger className='flex items-center justify-between w-full p-4 hover:bg-muted/50'>
                  <div className='flex items-center gap-2'>
                    <FileLock className='h-6 w-6' />
                    <h3 className='text-sm font-medium'>My Private Notes</h3>
                  </div>
                  {isDevNotesOpen ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className='p-4 pt-0 space-y-4'>
                    {task.notes?.map((note) => (
                      <div
                        key={note.id}
                        className='p-3 rounded-lg border bg-background/50'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-muted-foreground'>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className='flex gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0'
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditedNoteContent(note.content);
                              }}
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              {deletingNoteId === note.id ? (
                                <Check className='h-4 w-4' />
                              ) : (
                                <Trash2 className='h-4 w-4' />
                              )}
                            </Button>
                          </div>
                        </div>
                        {editingNoteId === note.id ? (
                          <div className='space-y-2'>
                            <Textarea
                              value={editedNoteContent}
                              onChange={(e) =>
                                setEditedNoteContent(e.target.value)
                              }
                              className='min-h-[100px] resize-none bg-background'
                            />
                            <div className='flex justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setEditingNoteId(null);
                                  setEditedNoteContent('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size='sm'
                                onClick={() => handleEditNote(note.id)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className='text-sm'>{note.content}</p>
                        )}
                      </div>
                    ))}

                    {!isAddingNote ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full h-8 hover:bg-muted/50'
                        onClick={() => setIsAddingNote(true)}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    ) : (
                      <div className='space-y-2'>
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder='Write a private note...'
                          className='min-h-[100px] resize-none bg-background/50'
                        />
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setIsAddingNote(false);
                              setNewNote('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button size='sm' onClick={handleCreateNote}>
                            Add Note
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

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
                {task.comments?.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <div className='p-4 rounded-lg border bg-card'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback>MM</AvatarFallback>
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
                  </React.Fragment>
                ))}

                {/* Show add comment button if no comments exist or after last comment */}
                {canCreateComment && !isAddingComment && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full h-8 hover:bg-muted/50'
                    onClick={() => setIsAddingComment(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                )}

                {/* Show comment input form when isAddingComment is true */}
                {isAddingComment && canCreateComment && (
                  <div className='space-y-2'>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder='Write a comment...'
                      className='flex-1'
                    />
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setIsAddingComment(false);
                          setNewComment('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size='sm'
                        onClick={async () => {
                          await handleCreateComment();
                          setIsAddingComment(false);
                        }}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            {canEdit && (
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start'
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className='mr-2 h-4 w-4' />
                {isEditing ? 'Cancel Editing' : 'Edit Task Description'}
              </Button>
            )}

            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <User className='h-4 w-4' />
                  Assignee
                </div>
                <div className='flex items-center gap-2'>
                  <Select
                    disabled={canEdit}
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
                  <ClipboardCheck className='h-4 w-4' />
                  Status
                </div>
                <Select
                  value={status}
                  onValueChange={(value: TaskStatus) => setStatus(value)}
                  disabled={canEdit}
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
                  <ListOrdered className='h-4 w-4' />
                  Priority
                </div>
                <Select
                  value={priority}
                  onValueChange={(value: TaskPriority) => setPriority(value)}
                  disabled={canEdit}
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
                  disabled={canEdit}
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
              {canDelete && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <DialogFooter className='mt-6'>
            <Button onClick={handleSave} disabled={!isEditing}>
              Save Changes
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailModal;

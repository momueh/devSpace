import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: (taskId: number, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);

  const handleUpdate = async () => {
    try {
      await onUpdate(task.id, {
        title,
        status,
        priority,
      });
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(task.id);
      onClose();
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todo'>Todo</SelectItem>
                <SelectItem value='in_progress'>In Progress</SelectItem>
                <SelectItem value='review'>In Review</SelectItem>
                <SelectItem value='done'>Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='priority'>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-between'>
            <Button variant='destructive' onClick={handleDelete}>
              Delete Task
            </Button>
            <Button onClick={handleUpdate}>Update Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

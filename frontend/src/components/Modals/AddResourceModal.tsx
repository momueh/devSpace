import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getVisibilityIcon } from '@/lib/helpers';
import { ResourceVisibility } from '@server/sharedTypes';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export function AddResourceModal({
  isOpen,
  onClose,
  projectId,
}: AddResourceModalProps) {
  const queryClient = useQueryClient();
  const [newResourceLink, setNewResourceLink] = useState({
    url: '',
    title: '',
    visibility: 'private' as ResourceVisibility,
  });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/project/${projectId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResourceLink),
      });

      if (!response.ok) throw new Error('Failed to create resource');

      queryClient.invalidateQueries(['project', projectId]);
      setNewResourceLink({
        url: '',
        title: '',
        visibility: 'private',
      });
      onClose();
      toast.success('Resource created successfully');
    } catch (error) {
      toast.error('Failed to create resource');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateResource} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='resourceTitle'>Title</Label>
            <Input
              id='resourceTitle'
              value={newResourceLink.title}
              onChange={(e) =>
                setNewResourceLink((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder='Enter title'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='resourceUrl'>URL</Label>
            <Input
              id='resourceUrl'
              value={newResourceLink.url}
              onChange={(e) =>
                setNewResourceLink((prev) => ({
                  ...prev,
                  url: e.target.value,
                }))
              }
              placeholder='Enter URL'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='visibility'>Visibility</Label>
            <div className='flex gap-2'>
              {['private', 'team', 'public'].map((v) => (
                <Button
                  key={v}
                  variant={
                    newResourceLink.visibility === v ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() =>
                    setNewResourceLink((prev) => ({
                      ...prev,
                      visibility: v as ResourceVisibility,
                    }))
                  }
                  type='button'
                >
                  {getVisibilityIcon(v as ResourceVisibility)}
                  <span className='ml-2 capitalize'>{v}</span>
                </Button>
              ))}
            </div>
          </div>
          <Button type='submit'>Add Resource</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

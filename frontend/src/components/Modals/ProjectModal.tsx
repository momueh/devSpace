import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: {
    id: number;
    name: string;
    description?: string;
  };
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'create' | 'invite'>(
    project ? 'create' : 'create'
  );
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [newProjectId, setNewProjectId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/project', {
        method: project ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          ...(project && { id: project.id }),
        }),
      });

      if (!response.ok) throw new Error('Failed to save project');

      const data = await response.json();

      if (!project) {
        setNewProjectId(data.id);
        setStep('invite');
        toast.success('Project created! You can now invite team members.');
        // Invalidate projects query
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      } else {
        toast.success('Project updated');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleInvite = async () => {
    try {
      const projectId = project?.id || newProjectId;
      const response = await fetch(`/api/project/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite user');
      }

      toast.success('Team member added successfully');
      setInviteEmail('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to invite user'
      );
    }
  };

  const handleClose = () => {
    setStep('create');
    setNewProjectId(null);
    setName('');
    setDescription('');
    setInviteEmail('');
    setInviteRole('developer');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {project ? 'Manage Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        {project ? (
          // Management View
          <Tabs defaultValue='details' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='details'>Project Details</TabsTrigger>
              <TabsTrigger value='team'>Team Members</TabsTrigger>
            </TabsList>

            <TabsContent value='details'>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Project Name</Label>
                  <Input
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Input
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button type='submit'>Update Project</Button>
              </form>
            </TabsContent>

            <TabsContent value='team' className='space-y-4'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='role'>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='developer'>Developer</SelectItem>
                      <SelectItem value='client'>Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite}>Add Team Member</Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : // Creation View
        step === 'create' ? (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Project Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type='submit'>Create Project</Button>
          </form>
        ) : (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='developer'>Developer</SelectItem>
                  <SelectItem value='client'>Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleInvite}>Add Team Member</Button>
              <Button variant='outline' onClick={handleClose}>
                Finish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

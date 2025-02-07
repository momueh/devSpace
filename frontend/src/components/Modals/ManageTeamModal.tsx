import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  members: Array<{
    user: {
      email: string;
      name: string;
    };
    role: string;
  }>;
}

export function ManageTeamModal({
  isOpen,
  onClose,
  projectId,
  members,
}: ManageTeamModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');

  const handleInvite = async () => {
    try {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Current Members List */}
          <div className='space-y-4'>
            <h3 className='font-medium'>Current Members</h3>
            <div className='space-y-2'>
              {members.map((member) => (
                <div
                  key={member.user.email}
                  className='flex items-center justify-between p-2 border rounded-md'
                >
                  <div>
                    <p className='font-medium'>{member.user.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {member.user.email}
                    </p>
                  </div>
                  <Badge>{member.role}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Form */}
          <div className='space-y-4'>
            <h3 className='font-medium'>Invite New Member</h3>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter email address'
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

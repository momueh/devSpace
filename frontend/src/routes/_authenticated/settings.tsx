import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { userQueryOptions } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const Route = {
  component: Settings,
};

function Settings() {
  const { isPending, error, data } = useQuery(userQueryOptions);

  if (isPending) return 'loading';
  if (error) return 'not logged in';
  console.log(data);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>
      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input id='name' defaultValue='John Doe' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' defaultValue='john@example.com' />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='project-updates'>Project Updates</Label>
              <Switch id='project-updates' defaultChecked />
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='task-assignments'>Task Assignments</Label>
              <Switch id='task-assignments' defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

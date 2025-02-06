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
import { updateUser } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!user) {
      return;
    }

    try {
      await updateUser(user.id, {
        firstname: formData.get('firstname') as string,
        lastname: formData.get('lastname') as string,
        email: formData.get('email') as string,
      });

      await queryClient.invalidateQueries({ queryKey: ['get-current-user'] });
      await router.invalidate();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleNotificationChange = async (checked: boolean) => {
    if (!user) {
      return;
    }
    try {
      await updateUser(user.id, {
        emailNotifications: checked,
      });

      await queryClient.invalidateQueries({ queryKey: ['get-current-user'] });
      await router.invalidate();
      toast.success('Notification preferences updated');
    } catch (error) {
      console.log(error);
      toast.error('Failed to update notification preferences');
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight pb-4'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>
      <div className='grid gap-8'>
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <form onSubmit={handleProfileSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstname'>First Name</Label>
                <Input
                  id='firstname'
                  name='firstname'
                  defaultValue={user?.firstname}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastname'>Last Name</Label>
                <Input
                  id='lastname'
                  name='lastname'
                  defaultValue={user?.lastname}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  defaultValue={user?.email}
                />
              </div>
              <Button type='submit'>Save Changes</Button>
            </form>
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
              <Label htmlFor='email-notifications'>Email Notifications</Label>
              <Switch
                id='email-notifications'
                checked={user?.emailNotifications}
                onCheckedChange={handleNotificationChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

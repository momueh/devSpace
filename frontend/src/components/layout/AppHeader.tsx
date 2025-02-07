import { LogOut, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Route } from '@/routes/_authenticated';
import { useNavigate } from '@tanstack/react-router';
import { api } from '@/lib/api';

export function AppHeader() {
  const { user, queryClient } = Route.useRouteContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.auth.logout.$post();

      // Clear all queries in React Query cache
      queryClient.clear();

      // Navigate to home page
      navigate({ to: '/' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 items-center justify-end gap-4 px-6'>
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-4'>
            <Search className='h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search tasks...'
              className='w-[300px] bg-background'
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                <User className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {user?.firstname} {user?.lastname}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className='mr-2 h-4 w-4' />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

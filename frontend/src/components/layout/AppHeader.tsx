import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
          <Button
            variant='ghost'
            className='relative w-full flex h-9 items-center  rounded-md border border-input bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:pr-12 md:w-40 lg:w-64'
          >
            {/* <Search className='mr-2 h-4 w-4' /> */}
            <span className='inline-flex'>Quick Navigation...</span>
            <kbd className='pointer-events-none absolute right-1.5 top-[50%] hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
              <span className='text-xs'>⌘</span>K
            </kbd>
          </Button>
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

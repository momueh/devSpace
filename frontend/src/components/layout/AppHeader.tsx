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

export function AppHeader() {
  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 items-center gap-4 px-6'>
        <div className='flex flex-1 items-center gap-4'>
          <Search className='h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search tasks...'
            className='w-[300px] bg-background'
          />
        </div>
        <div className='flex items-center gap-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                <User className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>John Doe</p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    john@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href='/api/logout'>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Logout</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

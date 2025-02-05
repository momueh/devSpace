import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export function BaseHeader() {
  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 items-center px-6'>
        <div className='flex flex-1 items-center'>
          <Link to='/' className='text-xl font-bold'>
            DevSpace
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' asChild>
            <a href='/api/login'>Login</a>
          </Button>
          <Button asChild>
            <a href='/api/register'>Register</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

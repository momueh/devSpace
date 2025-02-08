import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export function BaseHeader() {
  return (
    <header className='border-b bg-gradient-to-r from-blue-200 to-white-50 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 items-center px-6'>
        <div className='flex flex-1 items-center'>
          <Link to='/' className='flex items-center gap-2 font-semibold'>
            <img src='/logo.svg' alt='DevSpace Logo' className='h-8 w-auto' />
            <span className='text-xl'>DevSpace</span>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' asChild>
            <Link to='/login'>Login</Link>
          </Button>
          <Button asChild>
            <Link to='/register'>Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

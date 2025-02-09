import { createFileRoute, Link } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Home } from 'lucide-react';

export const Route = createFileRoute('/_public/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className='flex-1 flex flex-col items-center justify-center p-6 pt-36'>
      <div className='max-w-2xl w-full space-y-8 text-center'>
        <div className='space-y-4'>
          <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>
            Welcome to DevSpace
          </h1>
          <p className='text-xl text-muted-foreground pt-6'>
            Your personal workspace for managing development tasks and projects
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 py-6'>
          <Card className='text-left p-6 space-y-2'>
            <h3 className='font-semibold text-lg flex items-center gap-2'>
              <Home className='h-5 w-5 text-primary' />
              Project Management
            </h3>
            <p className='text-muted-foreground'>
              Get a clear overview of your project and pending work, all in one
              place.
            </p>
          </Card>
          <Card className='text-left p-6 space-y-2'>
            <h3 className='font-semibold text-lg flex items-center gap-2'>
              <CheckSquare className='h-5 w-5 text-primary' />
              Task Management
            </h3>
            <p className='text-muted-foreground'>
              Organize and track your development tasks across all your
              projects.
            </p>
          </Card>
        </div>

        <div className='space-y-4'>
          <Button className='w-full max-w-sm' size='lg' asChild>
            <Link to='/login'>Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

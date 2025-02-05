import { createFileRoute, Outlet } from '@tanstack/react-router';
import { userQueryOptions } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

const Login = () => {
  return (
    <div className='flex-1 flex flex-col items-center justify-center p-6'>
      <div className='text-center space-y-4'>
        <h2 className='text-2xl font-semibold'>Authentication Required</h2>
        <p className='text-muted-foreground'>
          Please login or register to access this page
        </p>
        <div className='flex gap-4 justify-center'>
          <Button asChild>
            <a href='/api/login'>Login</a>
          </Button>
          <Button variant='outline' asChild>
            <a href='/api/register'>Register</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedPage = () => {
  const { user } = Route.useRouteContext();
  if (!user) {
    return <Login />;
  }

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-background'>
        <AppSidebar />
        <div className='flex-1 flex flex-col'>
          <AppHeader />
          <main className='flex-1 p-6 animate-fade-in'>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;

    try {
      const data = await queryClient.fetchQuery(userQueryOptions);
      return data;
    } catch (e) {
      console.error(e);
      return { user: null };
    }
  },
  component: AuthenticatedPage,
});

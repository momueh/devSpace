import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
// import { AuthContextType } from '@/lib/auth/AuthProvider';
import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
// import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
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
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

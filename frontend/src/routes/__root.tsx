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
    <div className='min-h-screen flex flex-col bg-background'>
      <Outlet />
      <Toaster />
    </div>
  );
}

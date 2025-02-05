import { createFileRoute, Outlet } from '@tanstack/react-router';
import { BaseHeader } from '@/components/layout/BaseHeader';

export const Route = createFileRoute('/_public')({
  component: PublicPage,
});

function PublicPage() {
  return (
    <>
      <BaseHeader />
      <main className='flex-1 animate-fade-in'>
        <Outlet />
      </main>
    </>
  );
}

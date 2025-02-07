import { createFileRoute } from '@tanstack/react-router';
import { ProjectCard } from '@/components/ProjectCard';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUserProjectsQueryOptions } from '@/lib/api';
import { AddProjectModal } from '@/components/Modals/AddProjectModal';

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getUserProjectsQueryOptions()),
  component: Dashboard,
});

function EmptyProjects({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg p-6 text-center'>
      <h3 className='font-semibold text-lg mb-2'>No projects yet</h3>
      <p className='text-muted-foreground mb-4'>
        Get started by creating your first project, or ask your team to invite
        you to an existing project
      </p>
      <Button onClick={onCreateClick}>Create Project</Button>
    </div>
  );
}

function Dashboard() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { data: projects } = useSuspenseQuery(getUserProjectsQueryOptions());

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <Button onClick={() => setIsProjectModalOpen(true)}>
          Create Project
        </Button>
      </div>
      {projects.length === 0 ? (
        <EmptyProjects onCreateClick={() => setIsProjectModalOpen(true)} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
      <AddProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}

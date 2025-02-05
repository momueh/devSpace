import { createFileRoute } from '@tanstack/react-router';
import { ProjectCard } from '@/components/ProjectCard';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const projects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      progress: 75,
      tasks: { total: 20, completed: 15 },
    },
    {
      id: 2,
      name: 'Mobile App',
      progress: 30,
      tasks: { total: 15, completed: 5 },
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Overview of your projects and tasks
        </p>
      </div>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

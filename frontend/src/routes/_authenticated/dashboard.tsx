import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createFileRoute } from '@tanstack/react-router';

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
          <Card key={project.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Progress value={project.progress} />
                <div className='text-sm text-muted-foreground'>
                  {project.tasks.completed} of {project.tasks.total} tasks
                  completed
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

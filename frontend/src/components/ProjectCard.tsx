import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from '@tanstack/react-router';

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    progress: number;
    tasks: {
      total: number;
      completed: number;
    };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to='/project/$projectId'
      params={{ projectId: project.id.toString() }}
      className='block hover:opacity-80 transition-opacity'
    >
      <Card className='hover:shadow-lg transition-shadow'>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Progress value={project.progress} />
            <div className='text-sm text-muted-foreground'>
              {project.tasks.completed} of {project.tasks.total} tasks completed
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

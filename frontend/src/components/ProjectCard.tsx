import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Project } from '@server/sharedTypes';
import { Link } from '@tanstack/react-router';
import { Users } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const total = project.tasks.length;
  const doneCount = project.tasks.filter((t) => t.status === 'done').length;
  const donePercentage = (doneCount / total) * 100;

  return (
    <Link
      to='/project/$projectId'
      params={{ projectId: project.id.toString() }}
      className='block hover:opacity-80 transition-opacity'
    >
      <Card className='hover:shadow-lg transition-shadow'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>{project.name}</CardTitle>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-muted-foreground' />
            <Badge variant='secondary'>{project?.members?.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Progress value={donePercentage} className='bg-slate-200' />
            <div className='text-sm text-muted-foreground'>
              {total === 0
                ? '0 Tasks'
                : `${doneCount} of ${total} tasks completed`}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

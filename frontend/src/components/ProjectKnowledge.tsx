import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

import { getVisibilityIcon } from '@/lib/helpers';
import { ResourceVisibility } from '@server/sharedTypes';
import { useQueryClient } from '@tanstack/react-query';
import { Badge, Link, Pin, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const EmptyResources = ({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) => (
  <Card className='p-4 flex flex-col items-center justify-center text-center'>
    <div className='space-y-2 mb-4'>
      <h3 className='text-lg font-semibold'>No resources yet</h3>
      <p className='text-sm text-muted-foreground'>
        Add links to design documents, style guides and other resources to help
        your team collaborate.
      </p>
    </div>
    <Button onClick={onCreateClick}>
      <Plus className='h-4 w-4 mr-2' />
      Add Resource
    </Button>
  </Card>
);

const ProjectResourceCard = ({ resource, togglePin }) => (
  <a
    href={resource.url}
    target='_blank'
    rel='noopener noreferrer'
    className='flex items-center cursor-'
  >
    <Card
      key={resource.id}
      className='hover:shadow-md transition-shadow w-[200px]'
    >
      <CardContent className='flex flex-col items-start justify-between p-2.5'>
        <div className='flex justify-between gap-2 w-full'>
          {resource.title}
          <div className=''>
            <Button
              variant='ghost'
              size='sm'
              className=''
              onClick={() => togglePin(resource.id)}
            >
              <Pin
                className={`h-4 w-4 ${resource.isPinned ? 'fill-current' : ''}`}
              />
            </Button>
          </div>
        </div>

        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {getVisibilityIcon(resource.visibility)}
          <span className='capitalize ml-1'>{resource.visibility}</span>
        </div>
      </CardContent>
    </Card>
  </a>
);

interface ProjectKnowledgeProps {
  projectId: number;
  resources: Array<{
    id: number;
    title: string;
    url: string;
    visibility: ResourceVisibility;
    isPinned: boolean;
  }>;
}

export function ProjectKnowledge({
  projectId,
  resources,
}: ProjectKnowledgeProps) {
  const queryClient = useQueryClient();
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(true);
  const [newResourceLink, setNewResourceLink] = useState({
    url: '',
    title: '',
    visibility: 'private' as ResourceVisibility,
  });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/project/${projectId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResourceLink),
      });

      if (!response.ok) throw new Error('Failed to create resource');

      queryClient.invalidateQueries(['project', projectId]);
      setNewResourceLink({
        url: '',
        title: '',
        visibility: 'private',
      });
      toast.success('Resource created successfully');
    } catch (error) {
      toast.error('Failed to create resource');
    }
  };

  const togglePin = async (resourceId: number) => {
    try {
      const response = await fetch(
        `/api/project/${projectId}/resources/${resourceId}/toggle-pin`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) throw new Error('Failed to toggle pin status');

      queryClient.invalidateQueries(['project', projectId]);
      toast.success('Pin status updated');
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const sortedResources = [...resources].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {sortedResources.map((resource) => (
        <ProjectResourceCard
          key={resource.id}
          resource={resource}
          togglePin={togglePin}
        />
      ))}
    </div>
  );
}

export default ProjectKnowledge;

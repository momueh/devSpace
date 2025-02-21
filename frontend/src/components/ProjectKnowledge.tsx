import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { deleteResource } from '@/lib/api';

import { getVisibilityIcon } from '@/lib/helpers';
import { ResourceVisibility } from '@server/sharedTypes';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronUp, Pin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const EmptyResources = () => (
  <Card className='p-4 flex flex-col items-center justify-center text-center border-0 shadow-none'>
    <div className='space-y-2 mb-4'>
      <h3 className='text-md font-semibold'>No resources yet</h3>
      <p className='text-sm text-muted-foreground'>
        Add links to design documents, style guides and other resources to help
        your team collaborate.
      </p>
    </div>
  </Card>
);

interface ProjectResourceCardProps {
  resource: {
    id: number;
    title: string;
    url: string;
    visibility: ResourceVisibility;
    isPinned: boolean;
  };
  togglePin: (resourceId: number) => void;
  isSelected: boolean;
  onContextMenu: (e: React.MouseEvent, id: number) => void;
}

const ProjectResourceCard = ({
  resource,
  togglePin,
  isSelected,
  onContextMenu,
}: ProjectResourceCardProps) => (
  <div
    onContextMenu={(e) => onContextMenu(e, resource.id)}
    className={`prevent-select ${isSelected ? 'opacity-70' : ''}`}
  >
    <a
      href={resource.url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center cursor-'
      onClick={(e) => isSelected && e.preventDefault()}
    >
      <Card
        key={resource.id}
        className={`group hover:shadow-md transition-shadow w-[200px] ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
      >
        <CardContent className='flex flex-col items-start justify-between p-2.5'>
          <div className='flex justify-between gap-2 w-full'>
            {resource.title}
            <div className=''>
              <Button
                variant='ghost'
                size='sm'
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                  resource.isPinned ? 'opacity-100' : ''
                }`}
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
  </div>
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
  setIsAddResourceModalOpen: (open: boolean) => void;
  canCreate: boolean;
  canDelete: boolean;
}

export function ProjectKnowledge({
  projectId,
  resources,
  setIsAddResourceModalOpen,
  canCreate,
  canDelete,
}: ProjectKnowledgeProps) {
  const queryClient = useQueryClient();

  const [isResourcesOpen, setIsResourcesOpen] = useState(true);
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [isDeletingResources, setIsDeletingResources] = useState(false);

  const handleContextMenu = (e: React.MouseEvent, resourceId: number) => {
    e.preventDefault();
    setSelectedResources((prev) => {
      if (prev.includes(resourceId)) {
        return prev.filter((id) => id !== resourceId);
      }
      return [...prev, resourceId];
    });
  };

  const handleDeleteResources = async () => {
    if (!isDeletingResources) {
      setIsDeletingResources(true);
      return;
    }

    try {
      await Promise.all(
        selectedResources.map((resourceId) =>
          deleteResource(Number(projectId), resourceId)
        )
      );

      queryClient.invalidateQueries({
        queryKey: ['project', Number(projectId)],
      });
      toast.success('Resources deleted successfully');
      setSelectedResources([]);
      setIsDeletingResources(false);
    } catch {
      toast.error('Failed to delete resources');
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

      queryClient.invalidateQueries({
        queryKey: ['project', Number(projectId)],
      });
      toast.success('Pin status updated');
    } catch {
      toast.error('Failed to update pin status');
    }
  };

  const sortedResources = [...resources].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <div className='px-4 mx-2  py-6 border-2 border-gray-200 rounded-xl'>
      <Collapsible
        defaultOpen
        open={isResourcesOpen}
        onOpenChange={setIsResourcesOpen}
      >
        <div className='flex items-center gap-8'>
          <h2 className='text-md font-semibold'>Project Resources</h2>
          {canCreate && (
            <Button
              variant='outline'
              size='icon'
              onClick={() => setIsAddResourceModalOpen(true)}
            >
              <Plus className='h-4 w-4' />
            </Button>
          )}
          {selectedResources.length > 0 && canDelete && (
            <Button
              variant='destructive'
              size='sm'
              onClick={handleDeleteResources}
            >
              <Trash2 className='h-4 w-4 mr-2' />
              {isDeletingResources
                ? 'Click to confirm'
                : `Delete ${selectedResources.length} resource${
                    selectedResources.length === 1 ? '' : 's'
                  }`}
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='sm' className='ml-auto'>
              {isResourcesOpen ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronUp className='h-4 w-4' />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='pt-4'>
          {resources.length === 0 ? (
            <EmptyResources />
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {sortedResources.map((resource) => (
                <ProjectResourceCard
                  key={resource.id}
                  resource={resource}
                  togglePin={togglePin}
                  isSelected={selectedResources.includes(resource.id)}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ProjectKnowledge;

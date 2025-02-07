import * as React from 'react';
import { Settings, LayoutDashboard, Search, CheckSquare } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useNavigate } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search query state
  const [searchQuery, setSearchQuery] = React.useState('');

  // Search results query
  const { data: searchResults } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { tasks: [], projects: [] };
      const res = await api.search.$get({ query: { q: searchQuery } });
      return res.json();
    },
    enabled: searchQuery.length > 0,
  });

  const handleSelect = (value: string) => {
    setOpen(false);

    // Handle navigation commands
    if (value === 'dashboard') navigate({ to: '/dashboard' });
    if (value === 'my-devspace') navigate({ to: '/my-devspace' });
    if (value === 'settings') navigate({ to: '/settings' });

    // Handle task selection
    if (value.startsWith('task-')) {
      const taskId = value.replace('task-', '');
      const task = searchResults?.tasks.find((t) => t.id.toString() === taskId);
      if (task) {
        navigate({
          to: '/project/$projectId',
          params: { projectId: task.projectId.toString() },
        });
        // You'll need to implement a way to open the TaskDetailModal here
      }
    }

    // Handle project selection
    if (value.startsWith('project-')) {
      const projectId = value.replace('project-', '');
      navigate({
        to: '/project/$projectId',
        params: { projectId },
      });
    }
  };

  console.log('Current search state:', {
    query: searchQuery,
    results: searchResults,
  });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder='Type a command or search...'
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Show search results when available */}
        {searchResults?.projects && searchResults.projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading='Projects'>
              {searchResults.projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`project-${project.id}`}
                  onSelect={handleSelect}
                >
                  <Search className='mr-2 h-4 w-4' />
                  {project.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {searchResults?.tasks && searchResults.tasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading='Tasks'>
              {searchResults.tasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={`task-${task.id}`}
                  onSelect={handleSelect}
                >
                  <CheckSquare className='mr-2 h-4 w-4' />
                  {task.title}
                  <span className='ml-2 text-muted-foreground'>
                    in {task.project.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Always show navigation items */}
        <CommandGroup heading='Quick Navigation'>
          <CommandItem value='dashboard' onSelect={handleSelect}>
            <LayoutDashboard className='mr-2 h-4 w-4' />
            Dashboard
          </CommandItem>
          <CommandItem value='my-devspace' onSelect={handleSelect}>
            <CheckSquare className='mr-2 h-4 w-4' />
            My DevSpace
          </CommandItem>
          <CommandItem value='settings' onSelect={handleSelect}>
            <Settings className='mr-2 h-4 w-4' />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

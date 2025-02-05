import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  // TableBody,
  // TableCell,
  // TableHead,
  // TableHeader,
  // TableRow,
} from '@/components/ui/table';
import { Link } from '@tanstack/react-router';

export const Route = {
  component: MyDevSpace,
};

type Task = {
  id: number;
  title: string;
  project: string;
  status: 'In Progress' | 'Todo' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
};

const tasks: Task[] = [
  {
    id: 1,
    title: 'Implement authentication',
    project: 'E-commerce Platform',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-02-20',
  },
  {
    id: 2,
    title: 'Design database schema',
    project: 'Mobile App',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '2024-02-25',
  },
];

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Task',
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('title')}</div>
    ),
  },
  {
    accessorKey: 'project',
    header: 'Project',
    cell: ({ row }) => (
      <Link
        from='/my-devspace'
        to='/project/$projectId'
        params={{ projectId: row.original.id.toString() }}
        className='text-blue-500 hover:underline'
      >
        {row.getValue('project')}
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'In Progress'
              ? 'secondary'
              : status === 'Done'
                ? 'default'
                : 'outline'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string;
      return (
        <Badge
          variant={
            priority === 'High'
              ? 'destructive'
              : priority === 'Medium'
                ? 'secondary'
                : 'outline'
          }
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
  },
];

function MyDevSpace() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>My DevSpace</h1>
        <p className='text-muted-foreground'>
          View and manage all your tasks across projects
        </p>
      </div>
      <Table columns={columns} data={tasks} />
    </div>
  );
}

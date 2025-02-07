import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Task } from '@server/sharedTypes';
import { Link } from '@tanstack/react-router';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getUserProjectsQueryOptions } from '@/lib/api';
import { cn } from '@/lib/utils';

// Column definitions
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className='font-medium'>{row.getValue('id')}</div>,
  },
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
        to='/project/$projectId'
        params={{ projectId: row.original.projectId.toString() }}
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
          variant='secondary'
          className={cn(
            status === 'backlog' && 'bg-slate-100 text-slate-700',
            status === 'in_progress' && 'bg-amber-100 text-amber-700',
            status === 'in_review' && 'bg-purple-100 text-purple-700',
            status === 'done' && 'bg-green-100 text-green-700'
          )}
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
      return <Badge variant='secondary'>{priority}</Badge>;
    },
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => {
      const size = row.getValue('size') as string;
      return <Badge variant='secondary'>{size}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const task = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(task.id.toString())}
            >
              Copy task ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View task details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// DataTable component
function DataTable({ data }: { data: Task[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter tasks...'
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Route definition and main component
export const Route = createFileRoute('/_authenticated/my-devspace')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getUserProjectsQueryOptions()),
  component: MyDevSpace,
});

function MyDevSpace() {
  const { user } = Route.useRouteContext();
  const { data: projects } = useSuspenseQuery(getUserProjectsQueryOptions());

  // Flatten projects to get all tasks
  const tasks = projects.flatMap(
    (project) =>
      project.tasks?.map((task) => ({
        ...task,
        project: project.name,
        projectId: project.id,
      })) ?? []
  );

  const userTasks = tasks.filter((task) => task.assigneeId === user?.id);

  console.log('tasks', tasks);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight pb-4'>My DevSpace</h1>
        <p className='text-muted-foreground'>
          View and manage all tasks assigned to you across projects.
        </p>
      </div>
      <DataTable data={userTasks} />
    </div>
  );
}

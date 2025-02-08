import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Task, TaskPriority, TaskSize, TaskStatus } from '@server/sharedTypes';
import { Link } from '@tanstack/react-router';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
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
import {
  getPriorityDisplay,
  getSizeDisplay,
  getStatusDisplay,
  PRIORITY_ORDER,
  SIZE_ORDER,
  STATUS_ORDER,
} from '@/lib/helpers';

// Column definitions
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='p-0 w-full justify-start'
        >
          ID
          <ArrowUpDown className='ml-1 h-4 w-4' />
        </Button>
      );
    },

    cell: ({ row }) => <div className='font-medium'>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='p-0 w-full justify-start'
        >
          Task
          <ArrowUpDown className='ml-1 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        to='/project/$projectId'
        params={{ projectId: row.original.projectId.toString() }}
        search={{ taskId: row.original.id }}
        className='text-blue-500 hover:underline'
      >
        {row.getValue('title')}
      </Link>
    ),
  },
  {
    accessorKey: 'project',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='p-0 w-full justify-start'
        >
          Project
          <ArrowUpDown className='ml-1 h-4 w-4' />
        </Button>
      );
    },
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
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='p-0 w-full justify-start'
        >
          Status
          <ArrowUpDown className='ml-1 h-4 w-4' />
        </Button>
      );
    },
    sortingFn: (rowA, rowB) => {
      const statusA = rowA.getValue('status') as TaskStatus;
      const statusB = rowB.getValue('status') as TaskStatus;
      return STATUS_ORDER[statusA] - STATUS_ORDER[statusB];
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as TaskStatus;
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
          {getStatusDisplay(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='p-0 w-full justify-start'
        >
          Priority
          <ArrowUpDown className='ml-1 h-4 w-4' />
        </Button>
      );
    },
    sortingFn: (rowA, rowB) => {
      const priorityA = rowA.getValue('priority') as TaskPriority;
      const priorityB = rowB.getValue('priority') as TaskPriority;
      return PRIORITY_ORDER[priorityA] - PRIORITY_ORDER[priorityB];
    },
    cell: ({ row }) => {
      const priority = row.getValue('priority') as TaskPriority;
      return <Badge variant='secondary'>{getPriorityDisplay(priority)}</Badge>;
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='p-0 w-full justify-start'
        >
          Size
          <ArrowUpDown className='ml-1 h-4 w-4' />
        </Button>
      );
    },
    sortingFn: (rowA, rowB) => {
      const sizeA = rowA.getValue('size') as TaskSize;
      const sizeB = rowB.getValue('size') as TaskSize;
      return SIZE_ORDER[sizeA] - SIZE_ORDER[sizeB];
    },
    cell: ({ row }) => {
      const size = row.getValue('size') as TaskSize;
      return <Badge variant='secondary'>{getSizeDisplay(size)}</Badge>;
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
            <DropdownMenuItem asChild>
              <Link
                to='/project/$projectId'
                params={{ projectId: task.projectId.toString() }}
                search={{ taskId: task.id }}
              >
                View task details
              </Link>
            </DropdownMenuItem>
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
    <div className='p-4'>
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

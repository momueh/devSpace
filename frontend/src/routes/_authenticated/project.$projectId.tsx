import { createFileRoute } from '@tanstack/react-router'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const getProjectQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ['project', projectId],
    queryFn: () => getProject(parseInt(projectId)),
  })

export const Route = createFileRoute('/_authenticated/project/$projectId')({
  loader: ({ context: { queryClient }, params: { projectId } }) =>
    queryClient.ensureQueryData(getProjectQueryOptions(projectId)),
  component: ProjectPage,
})

function ProjectPage() {
  const { projectId } = Route.useParams()

  const {
    data: project,
    isLoading,
    isError,
  } = useSuspenseQuery(getProjectQueryOptions(projectId))

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return <div>Error loading project</div>
  }

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Implement authentication', status: 'In Progress' },
    { id: '2', title: 'Set up database', status: 'Done' },
    { id: '3', title: 'Design UI mockups', status: 'Backlog' },
    { id: '4', title: 'Write documentation', status: 'In Review' },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const columns: TaskStatus[] = ['Backlog', 'In Progress', 'In Review', 'Done']

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    reorderedItem.status = result.destination.droppableId as TaskStatus
    items.splice(result.destination.index, 0, reorderedItem)

    setTasks(items)
    toast(`Task moved to ${result.destination.droppableId}`)
  }

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'Backlog',
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle('')
    toast.success('Task created successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/my-devspace">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project #{id}</h1>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{column}</h2>
                <Badge variant="secondary">
                  {tasks.filter((task) => task.status === column).length}
                </Badge>
              </div>
              <Droppable droppableId={column}>
                {(provided) => (
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 p-2 min-h-[200px] bg-muted/50 rounded-lg"
                    >
                      {tasks
                        .filter((task) => task.status === column)
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <CardContent className="p-4">
                                  <p>{task.title}</p>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

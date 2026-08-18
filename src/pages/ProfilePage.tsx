import { useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList } from "lucide-react"
import { useBoards } from "@/context/BoardsContext"
import { usePeople } from "@/context/PeopleContext"
import { CURRENT_USER_ID } from "@/data/people"
import { PersonAvatar } from "@/components/shared/PersonAvatar"
import { EmptyState } from "@/components/shared/EmptyState"
import { InlineEditableText } from "@/components/shared/InlineEditableText"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Badge, badgeVariants } from "@/components/ui/badge"
import type { VariantProps } from "class-variance-authority"

const columnBadgeVariant: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
  todo: "secondary",
  "in-progress": "outline",
  done: "default",
}

export function ProfilePage() {
  const { boards } = useBoards()
  const { getPersonById, updatePerson } = usePeople()
  const currentUser = getPersonById(CURRENT_USER_ID)
  const [resetOpen, setResetOpen] = useState(false)

  function handleReset() {
    localStorage.removeItem("devboard.boards")
    localStorage.removeItem("devboard.people")
    localStorage.removeItem("devboard.onboarded")
    window.location.reload()
  }

  const assignedTasks = boards.flatMap((board) =>
    board.columns.flatMap((column) =>
      column.tasks
        .filter((task) => task.assigneeId === CURRENT_USER_ID)
        .map((task) => ({ task, board, column })),
    ),
  )

  const doneCount = assignedTasks.filter((entry) => entry.column.id === "done").length
  const boardCount = new Set(assignedTasks.map((entry) => entry.board.id)).size

  const stats = [
    { label: "Boards with tasks", value: boardCount },
    { label: "Assigned tasks", value: assignedTasks.length },
    { label: "Completed", value: doneCount },
  ]

  if (!currentUser) return null

  return (
    <div>
      <div className="flex items-center gap-4">
        <PersonAvatar person={currentUser} size="md" />
        <div>
          <InlineEditableText
            as="h1"
            value={currentUser.name}
            onSave={(name) => updatePerson(currentUser.id, { name, role: currentUser.role })}
            className="text-2xl font-semibold"
          />
          <InlineEditableText
            as="p"
            value={currentUser.role}
            placeholder="Click to add a role"
            onSave={(role) => updatePerson(currentUser.id, { name: currentUser.name, role })}
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Assigned tasks</h2>

        {assignedTasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks assigned"
            description="Tasks assigned to you across all boards will show up here."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {assignedTasks.map(({ task, board, column }) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <Link
                    to={`/boards/${board.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {board.title}
                  </Link>
                </div>
                <Badge variant={columnBadgeVariant[column.id]}>{column.title}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <h2 className="text-sm font-medium">Reset app data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clears all boards, tasks, and your profile from this browser. This cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-3"
          onClick={() => setResetOpen(true)}
        >
          Reset app data
        </Button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset app data?"
        description="This deletes every board and task, and clears your profile so you'll see the welcome screen again. This cannot be undone."
        confirmLabel="Reset"
        onConfirm={handleReset}
      />
    </div>
  )
}

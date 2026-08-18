import { useState } from "react"
import type { FormEvent } from "react"
import { X } from "lucide-react"
import type { Task, TaskInput } from "@/types"
import { usePeople } from "@/context/PeopleContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const UNASSIGNED = "unassigned"
const NEW_PERSON = "__new_person__"

interface TaskDialogProps {
  heading: string
  submitLabel: string
  task?: Task
  onClose: () => void
  onSubmit: (input: TaskInput) => void
}

export function TaskDialog({ heading, submitLabel, task, onClose, onSubmit }: TaskDialogProps) {
  const { people, addPerson } = usePeople()
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "")
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? UNASSIGNED)
  const [addingPerson, setAddingPerson] = useState(false)
  const [newPersonName, setNewPersonName] = useState("")

  const assigneeLabels: Record<string, string> = {
    [UNASSIGNED]: "Unassigned",
    ...Object.fromEntries(people.map((person) => [person.id, person.name])),
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
      dueDate: dueDate || null,
    })
  }

  function handleAddPerson() {
    const trimmedName = newPersonName.trim()
    if (!trimmedName) return

    const person = addPerson(trimmedName)
    setAssigneeId(person.id)
    setNewPersonName("")
    setAddingPerson(false)
  }

  return (
    <Dialog open onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Fix header layout on mobile"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional details"
                rows={3}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Assignee</Label>

              {addingPerson ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <Input
                    autoFocus
                    value={newPersonName}
                    onChange={(event) => setNewPersonName(event.target.value)}
                    placeholder="Person's name"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        handleAddPerson()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!newPersonName.trim()}
                    onClick={handleAddPerson}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setAddingPerson(false)
                      setNewPersonName("")
                    }}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Cancel</span>
                  </Button>
                </div>
              ) : (
                <Select
                  value={assigneeId ?? UNASSIGNED}
                  onValueChange={(value) => {
                    if (value === NEW_PERSON) {
                      setAddingPerson(true)
                      return
                    }
                    setAssigneeId(value ?? UNASSIGNED)
                  }}
                  items={assigneeLabels}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={NEW_PERSON}>+ Add new person</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!title.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

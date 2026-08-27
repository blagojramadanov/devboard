import type { Column } from "@/types"

export function createDefaultColumns(): Column[] {
  return [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]
}

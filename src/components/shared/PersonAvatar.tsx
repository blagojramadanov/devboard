import { User } from "lucide-react"
import type { Person } from "@/types"
import { cn } from "@/lib/utils"

interface PersonAvatarProps {
  person: Person | undefined
  size?: "sm" | "md"
}

export function PersonAvatar({ person, size = "sm" }: PersonAvatarProps) {
  const dimension = size === "sm" ? "size-6 text-[10px]" : "size-9 text-sm"

  if (!person) {
    return (
      <div
        title="Unassigned"
        className={cn(
          "flex items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground",
          dimension,
        )}
      >
        <User className={size === "sm" ? "size-3" : "size-4"} />
      </div>
    )
  }

  return (
    <div
      title={person.name}
      className={cn(
        "flex items-center justify-center rounded-full font-medium text-white",
        person.color,
        dimension,
      )}
    >
      {person.initials}
    </div>
  )
}

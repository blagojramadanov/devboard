import { NavLink } from "react-router-dom"
import { LayoutDashboard, KanbanSquare, Moon, Sun } from "lucide-react"
import { CURRENT_USER_ID } from "@/data/people"
import { usePeople } from "@/context/PeopleContext"
import { useTheme } from "@/context/ThemeContext"
import { PersonAvatar } from "@/components/shared/PersonAvatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  )

export function Navbar() {
  const { getPersonById } = usePeople()
  const currentUser = getPersonById(CURRENT_USER_ID)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <KanbanSquare className="size-5 text-primary" />
          DevBoard
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClasses}>
            <LayoutDashboard className="size-4" />
            Boards
          </NavLink>
          <NavLink to="/profile" className={navLinkClasses}>
            <PersonAvatar person={currentUser} size="sm" />
            Profile
          </NavLink>
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-1"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}

import { LayoutGrid } from "lucide-react"
import { useBoards } from "@/context/BoardsContext"
import { BoardCard } from "@/components/board-list/BoardCard"
import { CreateBoardDialog } from "@/components/board-list/CreateBoardDialog"
import { EmptyState } from "@/components/shared/EmptyState"

export function BoardsPage() {
  const { boards, deleteBoard } = useBoards()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Boards</h1>
          <p className="text-sm text-muted-foreground">
            {boards.length === 0 ? "No boards yet" : `${boards.length} board${boards.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <CreateBoardDialog />
      </div>

      {boards.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={LayoutGrid}
            title="No boards yet"
            description="Create your first board to start organizing tasks."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={deleteBoard} />
          ))}
        </div>
      )}
    </div>
  )
}

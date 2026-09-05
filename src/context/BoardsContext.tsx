import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Board, Column, ColumnId, Task, TaskInput } from "@/types";
import {
  getBoards,
  getBoardById,
  createBoard as createBoardRequest,
  deleteBoard as deleteBoardRequest,
  updateBoardTitle as updateBoardTitleRequest,
  createTask as createTaskRequest,
  updateTask as updateTaskRequest,
  moveTask as moveTaskRequest,
  deleteTask as deleteTaskRequest,
} from "@/services/boards";

function buildPositionUpdates(column: Column) {
  return column.tasks.map((task, index) => ({
    id: task.id,
    status: column.id,
    position: index,
  }));
}

type BoardsLoadStatus = "loading" | "ready" | "error";

interface BoardsContextValue {
  boards: Board[];
  boardsStatus: BoardsLoadStatus;
  boardsError: string | null;
  createBoard: (title: string) => Promise<Board>;
  deleteBoard: (boardId: string) => Promise<void>;
  loadBoardDetail: (boardId: string) => Promise<Board | null>;
  renameBoard: (boardId: string, title: string) => Promise<void>;
  createTask: (
    boardId: string,
    columnId: ColumnId,
    input: TaskInput,
  ) => Promise<void>;
  updateTask: (
    boardId: string,
    taskId: string,
    input: TaskInput,
  ) => Promise<void>;
  deleteTask: (boardId: string, taskId: string) => Promise<void>;
  moveTask: (
    boardId: string,
    taskId: string,
    targetColumnId: ColumnId,
    targetIndex: number,
  ) => Promise<void>;
}

const BoardsContext = createContext<BoardsContextValue | null>(null);

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsStatus, setBoardsStatus] = useState<BoardsLoadStatus>("loading");
  const [boardsError, setBoardsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getBoards()
      .then((fetched) => {
        if (cancelled) return;
        setBoards(fetched);
        setBoardsStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load boards from Supabase:", error);
        setBoardsError(
          error instanceof Error ? error.message : "Failed to load boards.",
        );
        setBoardsStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function createBoard(title: string): Promise<Board> {
    const board = await createBoardRequest(title);
    setBoards((prev) => [...prev, board]);
    return board;
  }

  async function deleteBoard(boardId: string): Promise<void> {
    await deleteBoardRequest(boardId);
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  }

  const loadBoardDetail = useCallback(
    async (boardId: string): Promise<Board | null> => {
      const board = await getBoardById(boardId);
      if (!board) return null;

      setBoards((prev) => {
        const exists = prev.some((item) => item.id === board.id);
        return exists
          ? prev.map((item) => (item.id === board.id ? board : item))
          : [...prev, board];
      });

      return board;
    },
    [],
  );

  async function renameBoard(boardId: string, title: string): Promise<void> {
    await updateBoardTitleRequest(boardId, title);
    setBoards((prev) =>
      prev.map((board) => (board.id === boardId ? { ...board, title } : board)),
    );
  }

  async function createTask(
    boardId: string,
    columnId: ColumnId,
    input: TaskInput,
  ): Promise<void> {
    const task = await createTaskRequest(boardId, columnId, input);
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((column) =>
            column.id === columnId
              ? { ...column, tasks: [...column.tasks, task] }
              : column,
          ),
        };
      }),
    );
  }

  async function updateTask(
    boardId: string,
    taskId: string,
    input: TaskInput,
  ): Promise<void> {
    const task = await updateTaskRequest(taskId, input);
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            tasks: column.tasks.map((item) =>
              item.id === taskId ? task : item,
            ),
          })),
        };
      }),
    );
  }

  async function deleteTask(boardId: string, taskId: string): Promise<void> {
    await deleteTaskRequest(taskId);

    const board = boards.find((item) => item.id === boardId);
    if (!board) return;

    const column = board.columns.find((item) =>
      item.tasks.some((task) => task.id === taskId),
    );
    if (!column) return;

    const remainingColumn: Column = {
      ...column,
      tasks: column.tasks.filter((task) => task.id !== taskId),
    };

    setBoards((prev) =>
      prev.map((item) =>
        item.id !== boardId
          ? item
          : {
              ...item,
              columns: item.columns.map((col) =>
                col.id === column.id ? remainingColumn : col,
              ),
            },
      ),
    );

    if (remainingColumn.tasks.length === 0) return;

    try {
      await moveTaskRequest(buildPositionUpdates(remainingColumn));
    } catch (error) {
      console.error("Failed to normalize task positions after delete:", error);
    }
  }

  async function moveTask(
    boardId: string,
    taskId: string,
    targetColumnId: ColumnId,
    targetIndex: number,
  ): Promise<void> {
    const board = boards.find((item) => item.id === boardId);
    if (!board) return;

    const sourceColumn = board.columns.find((column) =>
      column.tasks.some((task) => task.id === taskId),
    );
    if (!sourceColumn) return;

    let movedTask: Task | undefined;
    const columnsWithoutTask = board.columns.map((column) => {
      const found = column.tasks.find((task) => task.id === taskId);
      if (found) movedTask = found;
      return {
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      };
    });

    if (!movedTask) return;

    const nextColumns = columnsWithoutTask.map((column) => {
      if (column.id !== targetColumnId) return column;
      const tasks = [...column.tasks];
      const insertAt = Math.min(targetIndex, tasks.length);
      tasks.splice(insertAt, 0, movedTask as Task);
      return { ...column, tasks };
    });

    const previousBoard = board;
    const nextBoard = { ...board, columns: nextColumns };

    setBoards((prev) =>
      prev.map((item) => (item.id === boardId ? nextBoard : item)),
    );

    const affectedColumnIds = new Set([sourceColumn.id, targetColumnId]);
    const updates = nextColumns
      .filter((column) => affectedColumnIds.has(column.id))
      .flatMap((column) => buildPositionUpdates(column));

    try {
      await moveTaskRequest(updates);
    } catch (error) {
      setBoards((prev) =>
        prev.map((item) => (item.id === boardId ? previousBoard : item)),
      );
      throw error;
    }
  }

  return (
    <BoardsContext.Provider
      value={{
        boards,
        boardsStatus,
        boardsError,
        createBoard,
        deleteBoard,
        loadBoardDetail,
        renameBoard,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const context = useContext(BoardsContext);
  if (!context) {
    throw new Error("useBoards must be used within a BoardsProvider");
  }
  return context;
}

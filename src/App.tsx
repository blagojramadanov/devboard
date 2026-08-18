import { BrowserRouter, Routes, Route } from "react-router-dom"
import { BoardsProvider } from "@/context/BoardsContext"
import { PeopleProvider } from "@/context/PeopleContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { AppLayout } from "@/layouts/AppLayout"
import { BoardsPage } from "@/pages/BoardsPage"
import { BoardDetailPage } from "@/pages/BoardDetailPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { NotFoundPage } from "@/pages/NotFoundPage"

function App() {
  return (
    <ThemeProvider>
      <PeopleProvider>
        <BoardsProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<BoardsPage />} />
                <Route path="/boards/:boardId" element={<BoardDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </BoardsProvider>
      </PeopleProvider>
    </ThemeProvider>
  )
}

export default App

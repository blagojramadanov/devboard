import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { WelcomeDialog } from "@/components/shared/WelcomeDialog"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <WelcomeDialog />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

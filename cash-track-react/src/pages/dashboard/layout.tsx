import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Outlet } from "react-router-dom"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

export default function DashboardLayout() {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30">
      <Header />
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] p-4 lg:p-6 transition-all duration-300",
          isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]",
        )}
      >
        <Outlet />
      </main>
    </div>
  )
}


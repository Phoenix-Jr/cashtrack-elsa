import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ArrowLeftRight,
  FolderOpen,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  TrendingDown,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  Store,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/useAuth"
import { useDashboardStats } from "@/hooks/useTransaction"
import { useUIStore } from "@/stores/ui-store"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navigationItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard", requiresAdmin: false },
  {
    id: "transactions",
    label: "Opérations de caisse",
    icon: ArrowLeftRight,
    href: "/dashboard/transactions",
    requiresAdmin: false,
  },
  { id: "categories", label: "Catégories", icon: FolderOpen, href: "/dashboard/categories", requiresAdmin: false },
  { id: "users", label: "Utilisateurs", icon: Users, href: "/dashboard/users", requiresAdmin: true },
  { id: "analytics", label: "Statistiques", icon: BarChart3, href: "/dashboard/analytics", requiresAdmin: false },
  { id: "reports", label: "Rapports", icon: FileText, href: "/dashboard/reports", requiresAdmin: false },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/dashboard/settings", requiresAdmin: false },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const { data: stats } = useDashboardStats()
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed)
  const toggleSidebarCollapsed = useUIStore((state) => state.toggleSidebarCollapsed)
  
  const currentBalance = stats?.current_balance || 0
  const todayRecettes = stats?.today_recettes || 0
  const todayDepenses = stats?.today_depenses || 0
  const transactionCount = stats?.transaction_count || 0
  const isAdmin = user?.role === "admin"

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard"
    return location.pathname.startsWith(href)
  }

  const filteredNavItems = navigationItems.filter((item) => {
    if (item.requiresAdmin && !isAdmin) return false
    return true
  })

  return (
    <TooltipProvider delayDuration={0}>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-neutral-200/50 z-50 transition-all duration-300 flex flex-col",
          "lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarCollapsed ? "w-[72px]" : "w-[280px]",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className={cn("absolute top-2 right-2 lg:hidden text-neutral-500 hover:text-neutral-700")}
        >
          <X className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 z-10"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!isSidebarCollapsed && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B177C] to-[#0A1259] p-5 shadow-xl shadow-[#0B177C]/25">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <Store className="w-4 h-4" />
                  <span className="text-sm font-medium">Caisse du magasin</span>
                </div>
                <div className="text-2xl font-bold text-white mb-4">{formatCurrency(currentBalance)}</div>
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span>{transactionCount} opérations enregistrées</span>
                    </div>
              </div>
            </div>
          )}

          {isSidebarCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B177C] to-[#0A1259] flex items-center justify-center shadow-lg shadow-[#0B177C]/25">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">{formatCurrency(currentBalance)}</p>
                <p className="text-xs text-muted-foreground">Solde caisse</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              const navButton = (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.href)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "group relative flex items-center w-full rounded-xl transition-all duration-200",
                    isSidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                    active
                      ? "bg-gradient-to-r from-[#0B177C] to-[#0A1259] text-white shadow-lg shadow-[#0B177C]/30 scale-[1.02]"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-[#0B177C]",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-lg transition-all",
                      isSidebarCollapsed ? "w-9 h-9" : "w-9 h-9",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-neutral-100 text-neutral-600 group-hover:bg-[#0B177C]/10 group-hover:text-[#0B177C]",
                    )}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={cn("font-medium text-sm", active ? "text-white" : "text-neutral-900")}>
                      {item.label}
                    </span>
                  )}
                  {!isSidebarCollapsed && item.requiresAdmin && <Lock className="w-3 h-3 ml-auto text-neutral-400" />}
                </button>
              )

              if (isSidebarCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                      {item.requiresAdmin && <p className="text-xs text-muted-foreground">Admin uniquement</p>}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return navButton
            })}
          </nav>

          {!isSidebarCollapsed && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider px-2" style={{ color: '#B8B8B8' }}>Caisse du jour</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#10B981]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    <span className="text-sm text-neutral-700">Entrées</span>
                  </div>
                  <span className="text-sm font-semibold text-[#10B981]">{formatCurrency(todayRecettes)}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#EF4444]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                    <span className="text-sm text-neutral-700">Sorties</span>
                  </div>
                  <span className="text-sm font-semibold text-[#EF4444]">{formatCurrency(todayDepenses)}</span>
                </div>
              </div>
            </div>
          )}

          {isSidebarCollapsed && (
            <div className="space-y-2 flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center cursor-default">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold text-[#10B981]">{formatCurrency(todayRecettes)}</p>
                  <p className="text-xs text-muted-foreground">Entrées du jour</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 bg-[#EF4444]/10 rounded-xl flex items-center justify-center cursor-default">
                    <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold text-[#EF4444]">{formatCurrency(todayDepenses)}</p>
                  <p className="text-xs text-muted-foreground">Sorties du jour</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs" style={{ color: '#B8B8B8' }}>
              <div className="flex items-center gap-2">
                <span>CashTrack</span>
                {user && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "readonly"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-neutral-100 text-neutral-700",
                    )}
                  >
                    {user.role === "admin" ? "Admin" : user.role === "readonly" ? "Readonly" : "User"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>En ligne</span>
              </div>
            </div>
          </div>
        )}
        {isSidebarCollapsed && (
          <div className="p-4 border-t border-neutral-100 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-2 h-2 rounded-full bg-[#10B981] cursor-default" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>En ligne</p>
                {user && <p className="text-xs text-muted-foreground capitalize">{user.role}</p>}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}


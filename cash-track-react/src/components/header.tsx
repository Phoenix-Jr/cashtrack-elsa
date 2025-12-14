import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Search, Bell, Menu, LogOut, User, Settings, CalendarDays, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { useCurrentUser } from "@/hooks/useAuth"
import { useLogout } from "@/hooks/useAuth"
import { useUIStore } from "@/stores/ui-store"
import { format, startOfMonth } from "date-fns"
import { fr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

export function Header() {
  const { data: user } = useCurrentUser()
  const { mutate: logout } = useLogout()
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const periodFilter = useUIStore((state) => state.periodFilter)
  const setPeriodFilter = useUIStore((state) => state.setPeriodFilter)
  const navigate = useNavigate()
  const location = useLocation()

  const [isOpen, setIsOpen] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = periodFilter.from ? new Date(periodFilter.from) : undefined
    const to = periodFilter.to ? new Date(periodFilter.to) : undefined
    return from || to ? { from, to } : undefined
  })

  const showPeriodFilter = location.pathname === "/dashboard/transactions"

  const currentMonth = startOfMonth(new Date())

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      const fromStr = format(range.from, "yyyy-MM-dd")
      const toStr = format(range.to, "yyyy-MM-dd")
      setPeriodFilter(fromStr, toStr)
    }
  }

  const handleClearFilter = () => {
    setDateRange(undefined)
    setPeriodFilter("", "")
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const hasActiveFilter = periodFilter.from || periodFilter.to

  const getDisplayText = () => {
    if (!hasActiveFilter) return "Sélectionner une période"

    const from = periodFilter.from ? format(new Date(periodFilter.from), "d MMM yyyy", { locale: fr }) : ""
    const to = periodFilter.to ? format(new Date(periodFilter.to), "d MMM yyyy", { locale: fr }) : ""

    if (from && to) return `${from} - ${to}`
    if (from) return `Depuis ${from}`
    if (to) return `Jusqu'au ${to}`
    return "Sélectionner une période"
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden text-neutral-600 hover:text-[#0B177C] hover:bg-[#0B177C]/10"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="CashTrack Logo" 
              className="h-12 sm:h-16 rounded-xl object-contain shadow-lg bg-white/50 p-2"
            />
          </div>
        </div>

        {showPeriodFilter && (
          <div className="hidden md:flex items-center">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 min-w-[240px] justify-start bg-white ${hasActiveFilter ? "border-[#0B177C] text-[#0B177C]" : "text-neutral-600"}`}
                >
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">{getDisplayText()}</span>
                  {hasActiveFilter && (
                    <X
                      className="w-4 h-4 ml-auto shrink-0 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearFilter()
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="center">
                {/* Selected range display at top */}
                <div className="mb-4 pb-3 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      {dateRange?.from ? (
                        <span className="text-neutral-700">
                          <span className="font-semibold text-neutral-900">
                            {format(dateRange.from, "d MMMM yyyy", { locale: fr })}
                          </span>
                          {dateRange?.to && (
                            <>
                              <span className="mx-2 text-neutral-400">→</span>
                              <span className="font-semibold text-neutral-900">
                                {format(dateRange.to, "d MMMM yyyy", { locale: fr })}
                              </span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Cliquez pour sélectionner une période</span>
                      )}
                    </div>
                    {dateRange && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilter}
                        className="text-neutral-500 hover:text-red-500 h-7 px-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Calendar component */}
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from || currentMonth}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  locale={fr}
                  disabled={{ after: new Date() }}
                  className="rounded-lg border shadow-sm"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Search - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#B8B8B8' }} />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="w-full pl-10 bg-neutral-50 border-neutral-200 focus:bg-white focus:border-[#0B177C] transition-colors"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-neutral-600 hover:text-[#0B177C] hover:bg-[#0B177C]/10"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-neutral-100">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-[#0B177C] to-[#0A1259] text-white text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-neutral-700">
                  {user?.name || "Utilisateur"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                <p className="text-xs" style={{ color: '#B8B8B8' }}>{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <User className="w-4 h-4 mr-2" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-[#EF4444] focus:text-[#EF4444]">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}


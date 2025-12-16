import { useState, useMemo, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Search, Bell, Menu, LogOut, User, Settings, CalendarDays, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

type PeriodType = "today" | "week" | "month" | "year" | "custom" | "all"

export function Header() {
  const { data: user } = useCurrentUser()
  const { mutate: logout } = useLogout()
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const periodFilter = useUIStore((state) => state.periodFilter)
  const setPeriodFilter = useUIStore((state) => state.setPeriodFilter)
  const navigate = useNavigate()
  const location = useLocation()

  const [periodType, setPeriodType] = useState<PeriodType>("month")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isCustomOpen, setIsCustomOpen] = useState(false)

  // Show period filter on pages that use date filtering
  const showPeriodFilter = [
    "/dashboard/transactions",
    "/dashboard/analytics",
    "/dashboard"
  ].includes(location.pathname)

  // Calculer les dates selon le type de période
  const getDateRange = (type: PeriodType) => {
    const now = new Date()
    let startDate = ""
    let endDate = ""

    switch (type) {
      case "today":
        startDate = endDate = now.toISOString().split("T")[0]
        break
      case "week":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay() + 1)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        startDate = weekStart.toISOString().split("T")[0]
        endDate = weekEnd.toISOString().split("T")[0]
        break
      case "month":
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${lastDay}`
        break
      case "year":
        startDate = `${now.getFullYear()}-01-01`
        endDate = `${now.getFullYear()}-12-31`
        break
      case "custom":
        if (dateRange?.from && dateRange?.to) {
          startDate = format(dateRange.from, "yyyy-MM-dd")
          endDate = format(dateRange.to, "yyyy-MM-dd")
        }
        break
      case "all":
        startDate = ""
        endDate = ""
        break
    }

    return { startDate, endDate }
  }

  // Détecter le type de période actuel depuis les filtres et mettre à jour dateRange
  useEffect(() => {
    // Toujours mettre à jour dateRange pour le calendrier
    if (periodFilter.from && periodFilter.to) {
      setDateRange({
        from: new Date(periodFilter.from),
        to: new Date(periodFilter.to),
      })
    } else {
      setDateRange(undefined)
    }

    if (!periodFilter.from || !periodFilter.to) {
      setPeriodType("all")
      return
    }

    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    const weekStartStr = weekStart.toISOString().split("T")[0]
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const weekEndStr = weekEnd.toISOString().split("T")[0]
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${lastDay}`
    const yearStart = `${now.getFullYear()}-01-01`
    const yearEnd = `${now.getFullYear()}-12-31`

    if (periodFilter.from === today && periodFilter.to === today) {
      setPeriodType("today")
    } else if (periodFilter.from === weekStartStr && periodFilter.to === weekEndStr) {
      setPeriodType("week")
    } else if (periodFilter.from === monthStart && periodFilter.to === monthEnd) {
      setPeriodType("month")
    } else if (periodFilter.from === yearStart && periodFilter.to === yearEnd) {
      setPeriodType("year")
    } else {
      setPeriodType("custom")
    }
  }, [periodFilter.from, periodFilter.to])

  // Appliquer le filtre de période
  const handlePeriodChange = (type: PeriodType) => {
    setPeriodType(type)
    const { startDate, endDate } = getDateRange(type)
    setPeriodFilter(startDate, endDate)
    
    // Mettre à jour dateRange pour le calendrier
    if (startDate && endDate) {
      setDateRange({
        from: new Date(startDate),
        to: new Date(endDate),
      })
    } else {
      setDateRange(undefined)
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      const startDate = format(range.from, "yyyy-MM-dd")
      const endDate = format(range.to, "yyyy-MM-dd")
      setPeriodFilter(startDate, endDate)
      // Mettre à jour le type de période à "custom" quand l'utilisateur sélectionne manuellement
      setPeriodType("custom")
    }
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

  // Fonction pour obtenir le texte d'une période avec ses dates
  const getPeriodText = (type: PeriodType) => {
    const now = new Date()
    let fromDate: Date
    let toDate: Date

    switch (type) {
      case "today":
        fromDate = toDate = now
        const day = format(fromDate, "d MMM yyyy", { locale: fr })
        return `Aujourd'hui (${day})`
      case "week": {
        fromDate = new Date(now)
        fromDate.setDate(now.getDate() - now.getDay() + 1)
        toDate = new Date(fromDate)
        toDate.setDate(fromDate.getDate() + 6)
        const from = format(fromDate, "d MMM", { locale: fr })
        const to = format(toDate, "d MMM yyyy", { locale: fr })
        return `Cette semaine (${from} - ${to})`
      }
      case "month": {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        const monthLabel = format(fromDate, "MMMM yyyy", { locale: fr })
        return `Ce mois (${monthLabel})`
      }
      case "year": {
        fromDate = new Date(now.getFullYear(), 0, 1)
        toDate = new Date(now.getFullYear(), 11, 31)
        const yearLabel = format(fromDate, "yyyy", { locale: fr })
        return `Cette année (${yearLabel})`
      }
      case "custom": {
        if (dateRange?.from && dateRange?.to) {
          const from = format(dateRange.from, "d MMM yyyy", { locale: fr })
          const to = format(dateRange.to, "d MMM yyyy", { locale: fr })
          return `Personnalisé (${from} - ${to})`
        }
        return "Personnalisé"
      }
      case "all":
      default:
        return "Toutes les périodes"
    }
  }

  const getDisplayText = () => {
    // Si aucune période n'est appliquée
    if (!periodFilter.from || !periodFilter.to) {
      return "Toutes les périodes"
    }

    const fromDate = new Date(periodFilter.from)
    const toDate = new Date(periodFilter.to)

    switch (periodType) {
      case "today": {
        const day = format(fromDate, "d MMM yyyy", { locale: fr })
        return `Aujourd'hui (${day})`
      }
      case "week": {
        const from = format(fromDate, "d MMM", { locale: fr })
        const to = format(toDate, "d MMM yyyy", { locale: fr })
        return `Cette semaine (${from} - ${to})`
      }
      case "month": {
        const monthLabel = format(fromDate, "MMMM yyyy", { locale: fr })
        return `Ce mois (${monthLabel})`
      }
      case "year": {
        const yearLabel = format(fromDate, "yyyy", { locale: fr })
        return `Cette année (${yearLabel})`
      }
      case "custom": {
        if (dateRange?.from && dateRange?.to) {
          const from = format(dateRange.from, "d MMM yyyy", { locale: fr })
          const to = format(dateRange.to, "d MMM yyyy", { locale: fr })
          return `${from} - ${to}`
        }
        const from = format(fromDate, "d MMM yyyy", { locale: fr })
        const to = format(toDate, "d MMM yyyy", { locale: fr })
        return `${from} - ${to}`
      }
      case "all":
      default:
        return "Toutes les périodes"
    }
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
          <div className="hidden md:flex items-center gap-2">
            <Select value={periodType} onValueChange={(value: PeriodType) => handlePeriodChange(value)}>
              <SelectTrigger className="w-[260px] bg-white">
                <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate text-sm">{getDisplayText()}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{getPeriodText("today")}</SelectItem>
                <SelectItem value="week">{getPeriodText("week")}</SelectItem>
                <SelectItem value="month">{getPeriodText("month")}</SelectItem>
                <SelectItem value="year">{getPeriodText("year")}</SelectItem>
                <SelectItem value="all">{getPeriodText("all")}</SelectItem>
                <SelectItem value="custom">{getPeriodText("custom")}</SelectItem>
              </SelectContent>
            </Select>
            <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white min-w-[200px]">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm truncate">
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "d MMM", { locale: fr })} - ${format(dateRange.to, "d MMM", { locale: fr })}`
                      : "Sélectionner dates"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  locale={fr}
                  defaultMonth={dateRange?.from || new Date()}
                  disabled={(date) => date > new Date()}
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


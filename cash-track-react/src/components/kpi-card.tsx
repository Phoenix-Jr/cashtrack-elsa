import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  valueColor?: string
  subtitle?: string
  subtitleIcon?: LucideIcon
  description?: string
  trend?: number | null
  className?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconColor = "text-[#0B177C]",
  iconBgColor = "bg-[#0B177C]/10",
  valueColor = "text-neutral-900",
  subtitle,
  subtitleIcon: SubtitleIcon,
  description,
  trend,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-blue-50/30", className)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#0B177C]/5 rounded-full -mr-12 -mt-12 blur-xl" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className={cn("text-sm font-semibold", valueColor === "text-white" ? "text-white/90" : "text-neutral-700")}>
          {title}
        </CardTitle>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shadow-md", iconBgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0">
        <div className={cn("text-xl lg:text-2xl font-bold mb-1", valueColor)}>
          {value}
        </div>
        {subtitle && (
          <div className="flex items-center gap-1.5">
            {SubtitleIcon && (
              <SubtitleIcon className={cn("w-3.5 h-3.5", valueColor === "text-white" ? "text-white/70" : "text-neutral-500")} />
            )}
            <p className={cn("text-xs", valueColor === "text-white" ? "text-white/80" : "text-neutral-600")}>
              {subtitle}
            </p>
          </div>
        )}
        {description && (
          <p className={cn("text-xs mt-1", valueColor === "text-white" ? "text-white/70" : "text-neutral-500")}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}


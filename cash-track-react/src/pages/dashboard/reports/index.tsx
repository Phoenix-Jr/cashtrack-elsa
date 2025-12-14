import { useState } from "react"
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/kpi-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { toast } from "sonner"
import { useCurrentUser } from "@/hooks/useAuth"
import { useDashboardStats } from "@/hooks/useTransaction"
import { useGenerateBackendReport } from "@/hooks/useReport"

export default function ReportsPage() {
  const { data: currentUser } = useCurrentUser()
  const isReadOnly = currentUser?.role === "readonly"
  
  // États
  const [customPeriod, setCustomPeriod] = useState({ start: "", end: "" })
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Hooks
  const { data: dashboardStatsData } = useDashboardStats()
  const generateBackendReportMutation = useGenerateBackendReport()
  
  const totalRecettes = dashboardStatsData?.total_recettes || 0
  const totalDepenses = dashboardStatsData?.total_depenses || 0
  const currentBalance = dashboardStatsData?.current_balance || 0

  // Calculer les dates selon le type
  const getDateRange = (type: "daily" | "weekly" | "monthly" | "annual" | "custom") => {
    const now = new Date()
    let startDate = ""
    let endDate = ""

    switch (type) {
      case "daily":
        startDate = endDate = now.toISOString().split("T")[0]
        break
      case "weekly":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay() + 1)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        startDate = weekStart.toISOString().split("T")[0]
        endDate = weekEnd.toISOString().split("T")[0]
        break
      case "monthly":
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${lastDay}`
        break
      case "annual":
        startDate = `${now.getFullYear()}-01-01`
        endDate = `${now.getFullYear()}-12-31`
        break
      case "custom":
        startDate = customPeriod.start
        endDate = customPeriod.end
        break
    }

    return { startDate, endDate }
  }

  // Validation période personnalisée
  const validateCustomPeriod = () => {
    if (!customPeriod.start || !customPeriod.end) {
      return { valid: false, error: "Veuillez sélectionner une période complète" }
    }
    const start = new Date(customPeriod.start)
    const end = new Date(customPeriod.end)
    if (start > end) {
      return { valid: false, error: "La date de début doit être antérieure à la date de fin" }
    }
    if (end > new Date()) {
      return { valid: false, error: "La date de fin ne peut pas être dans le futur" }
    }
    return { valid: true }
  }

  // Générer et télécharger un rapport
  const handleGenerateReport = async (type: "daily" | "weekly" | "monthly" | "annual" | "custom") => {
    if (type === "custom") {
      const validation = validateCustomPeriod()
      if (!validation.valid) {
        toast.error(validation.error || "Période invalide")
        return
      }
    }

    setIsGenerating(true)
    try {
      const { startDate, endDate } = getDateRange(type)
      
      if (!startDate || !endDate) {
        toast.error("Impossible de déterminer la période du rapport")
        return
      }

      // Générer via le backend (génère, sauvegarde et télécharge)
      await generateBackendReportMutation.mutateAsync({
        format: "xlsx",
        reportType: type,
        dateFrom: startDate,
        dateTo: endDate,
      })
      
      toast.success("Rapport généré et téléchargé avec succès")
    } catch (error: any) {
      console.error("Erreur lors de la génération:", error)
      toast.error(error?.message || "Erreur lors de la génération du rapport")
    } finally {
      setIsGenerating(false)
    }
  }

  const reportTypes = [
    {
      type: "daily" as const,
      title: "Rapport journalier",
      description: "Résumé des opérations du jour",
      icon: Calendar,
      color: "#F59E0B",
    },
    {
      type: "weekly" as const,
      title: "Rapport hebdomadaire",
      description: "Résumé de la semaine",
      icon: Calendar,
      color: "#EC4899",
    },
    {
      type: "monthly" as const,
      title: "Rapport mensuel",
      description: "Résumé du mois",
      icon: Calendar,
      color: "#0B177C",
    },
    {
      type: "annual" as const,
      title: "Rapport annuel",
      description: "Résumé de l'année",
      icon: Calendar,
      color: "#10B981",
    },
    {
      type: "custom" as const,
      title: "Rapport personnalisé",
      description: "Période libre",
      icon: Calendar,
      color: "#8B5CF6",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
            Rapports de Caisse
          </h1>
          <p className="text-neutral-500 mt-1">Générez et téléchargez vos rapports financiers</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Encaissements"
          value={formatCurrency(totalRecettes)}
          icon={TrendingUp}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#10B981] to-[#059669]"
          valueColor="text-[#10B981]"
          className="bg-gradient-to-br from-white to-green-50/30"
        />
        <KPICard
          title="Total Décaissements"
          value={formatCurrency(totalDepenses)}
          icon={TrendingDown}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
          valueColor="text-[#EF4444]"
          className="bg-gradient-to-br from-white to-red-50/30"
        />
        <KPICard
          title="Solde Actuel"
          value={formatCurrency(currentBalance)}
          icon={Wallet}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#0B177C] to-[#0A1259]"
          valueColor="text-neutral-900"
          className="bg-gradient-to-br from-white to-blue-50/30"
        />
      </div>

      {/* Report Generation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.type} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${report.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: report.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{report.title}</CardTitle>
                    <p className="text-xs text-neutral-500 mt-1">{report.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {report.type === "custom" ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Début</Label>
                        <Input
                          type="date"
                          value={customPeriod.start}
                          onChange={(e) => setCustomPeriod((p) => ({ ...p, start: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fin</Label>
                        <Input
                          type="date"
                          value={customPeriod.end}
                          onChange={(e) => setCustomPeriod((p) => ({ ...p, end: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleGenerateReport(report.type)}
                      disabled={isGenerating || !customPeriod.start || !customPeriod.end || isReadOnly}
                      className="w-full h-8 text-xs text-white"
                      style={{ backgroundColor: report.color }}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      Générer
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleGenerateReport(report.type)}
                    disabled={isGenerating || isReadOnly}
                    className="w-full h-8 text-xs text-white"
                    style={{ backgroundColor: report.color }}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 mr-1" />
                    )}
                    Générer
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

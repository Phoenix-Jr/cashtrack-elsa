import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  User,
  Clock,
  DollarSign,
  Activity,
  Percent,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/useAuth"
import { useTransactions, useDashboardStats, useAnalytics } from "@/hooks/useTransaction"
import { formatCurrency, formatDate } from "@/lib/format"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { KPICard } from "@/components/kpi-card"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"

const COLORS = ["#10B981", "#EF4444", "#8B5CF6", "#F59E0B", "#0B177C", "#EC4899", "#14B8A6", "#F97316"]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const { data: transactionsData } = useTransactions({ page_size: 5 })
  const { data: stats } = useDashboardStats()
  
  // Get analytics data for last 30 days
  const dateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")
  const dateTo = format(new Date(), "yyyy-MM-dd")
  const { data: analyticsData } = useAnalytics({ date_from: dateFrom, date_to: dateTo })

  const transactions = transactionsData?.results || []
  const currentBalance = stats?.current_balance || 0
  const totalRecettes = stats?.total_recettes || 0
  const totalDepenses = stats?.total_depenses || 0
  const transactionCount = stats?.transaction_count || 0
  const todayRecettes = stats?.today_recettes || 0
  const todayDepenses = stats?.today_depenses || 0

  // Calculate additional KPIs
  const profitMargin = totalRecettes > 0 ? ((totalRecettes - totalDepenses) / totalRecettes) * 100 : 0
  const avgTransactionAmount = transactionCount > 0 ? (totalRecettes + totalDepenses) / transactionCount : 0
  const recetteDepenseRatio = totalDepenses > 0 ? (totalRecettes / totalDepenses) : 0

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!analyticsData?.area_data) {
      return {
        areaData: [],
        pieData: [
          { name: "Recettes", value: totalRecettes, color: "#10B981" },
          { name: "Dépenses", value: totalDepenses, color: "#EF4444" },
        ],
        categoryData: [],
      }
    }

    const areaData = analyticsData.area_data.map((item) => ({
      ...item,
      date: format(new Date(item.date), "dd MMM", { locale: fr }),
      solde: item.recettes - item.depenses,
    }))

    const pieData = [
      { name: "Recettes", value: analyticsData.total_recettes || totalRecettes, color: "#10B981" },
      { name: "Dépenses", value: analyticsData.total_depenses || totalDepenses, color: "#EF4444" },
    ]

    const categoryData = (analyticsData.category_data || [])
      .slice(0, 5)
      .map((cat, index) => ({
        name: cat.name,
        value: cat.value,
        color: cat.color || COLORS[index % COLORS.length],
      }))

    return { areaData, pieData, categoryData }
  }, [analyticsData, totalRecettes, totalDepenses])

  // Get latest 5 transactions sorted by date
  const latestTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
              Bonjour, {user?.name?.split(" ")[0] || "Utilisateur"}
            </h1>
            <p className="text-neutral-500 text-sm">Vue d&apos;ensemble de la caisse du magasin</p>
          </div>
          {user?.role !== "readonly" && (
            <Button
              onClick={() => navigate("/dashboard/transactions")}
              className="bg-gradient-to-r from-[#0B177C] to-[#0A1259] hover:from-[#0A1259] hover:to-[#0B177C] text-white shadow-lg shadow-[#0B177C]/25 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle opération
            </Button>
          )}
        </div>

        {/* Stats Cards - All KPIs in one row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KPICard
            title="Solde caisse"
            value={formatCurrency(currentBalance)}
            icon={Store}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#0B177C] to-[#0A1259]"
            valueColor="text-neutral-900"
            subtitle="Temps réel"
            className="col-span-2 md:col-span-1 bg-gradient-to-br from-white to-blue-50/30"
          />
          
          <KPICard
            title="Total entrées"
            value={formatCurrency(totalRecettes)}
            icon={TrendingUp}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#10B981] to-[#059669]"
            valueColor="text-[#10B981]"
            subtitle={`${transactions.filter((t) => t.type === "recette").length} opérations`}
            subtitleIcon={ArrowUpRight}
            className="bg-gradient-to-br from-white to-green-50/30"
          />

          <KPICard
            title="Total sorties"
            value={formatCurrency(totalDepenses)}
            icon={TrendingDown}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
            valueColor="text-[#EF4444]"
            subtitle={`${transactions.filter((t) => t.type === "depense").length} opérations`}
            subtitleIcon={ArrowDownRight}
            className="bg-gradient-to-br from-white to-red-50/30"
          />

          <KPICard
            title="Marge"
            value={`${profitMargin.toFixed(1)}%`}
            icon={Percent}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"
            valueColor="text-[#8B5CF6]"
            subtitle={profitMargin >= 0 ? "Bénéfice" : "Déficit"}
            className="bg-gradient-to-br from-white to-purple-50/30"
          />

          <KPICard
            title="Opérations"
            value={transactionCount}
            icon={Activity}
            iconColor="text-[#0B177C]"
            iconBgColor="bg-[#0B177C]/10"
            valueColor="text-neutral-900"
            subtitle="Total"
            className="bg-gradient-to-br from-white to-blue-50/30"
          />

          <KPICard
            title="Moyenne"
            value={formatCurrency(avgTransactionAmount)}
            icon={DollarSign}
            iconColor="text-[#10B981]"
            iconBgColor="bg-[#10B981]/10"
            valueColor="text-[#10B981]"
            subtitle="Par transaction"
            className="bg-gradient-to-br from-white to-green-50/30"
          />

          <KPICard
            title="Ratio"
            value={`${recetteDepenseRatio.toFixed(2)}:1`}
            icon={BarChart3}
            iconColor="text-[#F59E0B]"
            iconBgColor="bg-[#F59E0B]/10"
            valueColor="text-[#F59E0B]"
            subtitle={recetteDepenseRatio >= 1 ? "R > D" : "R < D"}
            className="bg-gradient-to-br from-white to-orange-50/30"
          />
        </div>

        {/* Charts and Transactions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Evolution du solde */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-neutral-900">Évolution (30j)</CardTitle>
              <p className="text-xs text-neutral-500">Recettes et dépenses</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData.areaData}>
                  <defs>
                    <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="recettes"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorRecettes)"
                    name="Recettes"
                  />
                  <Area
                    type="monotone"
                    dataKey="depenses"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#colorDepenses)"
                    name="Dépenses"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions - Compact */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-neutral-900">Dernières opérations</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard/transactions")}
                  className="text-xs text-[#0B177C] hover:text-[#0A1259] hover:bg-[#0B177C]/10 h-7 px-2"
                >
                  Voir tout
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {latestTransactions.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 text-sm">Aucune opération</div>
                ) : (
                  latestTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            transaction.type === "recette"
                              ? "bg-[#10B981]/10 text-[#10B981]"
                              : "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}
                        >
                          {transaction.type === "recette" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-neutral-900 truncate">
                            {transaction.description || <span className="text-neutral-400 italic">Sans description</span>}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {transaction.createdAt ? formatDate(transaction.createdAt) : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p
                          className={`font-semibold text-sm ${
                            transaction.type === "recette" ? "text-[#10B981]" : "text-[#EF4444]"
                          }`}
                        >
                          {transaction.type === "recette" ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Répartition Recettes/Dépenses */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-neutral-900">Répartition globale</CardTitle>
              <p className="text-xs text-neutral-500">Proportion recettes/dépenses</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 flex justify-center gap-4 flex-wrap">
                {chartData.pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-neutral-600">{item.name}</span>
                    <span className="text-xs font-semibold text-neutral-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          {chartData.categoryData.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-neutral-900">Top 5 Catégories</CardTitle>
                <p className="text-xs text-neutral-500">Les plus utilisées</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData.categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    type="number"
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    width={100}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-neutral-900">Dernières opérations</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">Les 5 dernières opérations de caisse</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/transactions")}
              className="text-[#0B177C] hover:text-[#0A1259] hover:bg-[#0B177C]/10"
            >
              Voir tout
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestTransactions.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">Aucune opération pour le moment</div>
              ) : (
                latestTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === "recette"
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#EF4444]/10 text-[#EF4444]"
                        }`}
                      >
                        {transaction.type === "recette" ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">
                          {transaction.description || <span className="text-neutral-400 italic">Sans description</span>}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {transaction.createdAt ? formatDate(transaction.createdAt) : ""}
                          {transaction.exporterFournisseur && ` • ${transaction.exporterFournisseur}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p
                          className={`font-semibold ${
                            transaction.type === "recette" ? "text-[#10B981]" : "text-[#EF4444]"
                          }`}
                        >
                          {transaction.type === "recette" ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-neutral-400">{transaction.ref}</p>
                      </div>
                      {transaction.createdBy && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-8 h-8 rounded-full bg-[#0B177C]/10 flex items-center justify-center cursor-default">
                              <User className="w-4 h-4 text-[#0B177C]" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{transaction.createdBy}</p>
                              {transaction.createdAt && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(transaction.createdAt).toLocaleString("fr-FR")}
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

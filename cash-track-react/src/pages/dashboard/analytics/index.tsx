import { useMemo } from "react"
import { LineChart, PieChart, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/kpi-card"
import { useAnalytics } from "@/hooks/useTransaction"
import { useUIStore } from "@/stores/ui-store"
import { formatCurrency } from "src/lib/format.ts"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const COLORS = ["#0B177C", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316"]

export default function AnalyticsPage() {
  const periodFilter = useUIStore((state) => state.periodFilter)
  const { data: analyticsData, isLoading } = useAnalytics({
    date_from: periodFilter.from,
    date_to: periodFilter.to,
  })

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!analyticsData) {
      return {
        areaData: [],
        pieData: [
          { name: "Recettes", value: 0, color: "#10B981" },
          { name: "Dépenses", value: 0, color: "#EF4444" },
        ],
        categoryData: [],
      }
    }

    // Format area data with proper date formatting
    const areaData = analyticsData.area_data.map((item) => ({
      ...item,
      date: format(new Date(item.date), "dd MMM", { locale: fr }),
      dateFull: item.date,
    }))

    // Pie chart data
    const pieData = [
      { name: "Recettes", value: analyticsData.total_recettes, color: "#10B981" },
      { name: "Dépenses", value: analyticsData.total_depenses, color: "#EF4444" },
    ]

    // Category data for bar chart
    const categoryData = analyticsData.category_data.map((cat, index) => ({
      name: cat.name,
      value: cat.value,
      color: cat.color || COLORS[index % COLORS.length],
      recettes: cat.recettes,
      depenses: cat.depenses,
    }))

    return { areaData, pieData, categoryData }
  }, [analyticsData])

  const currentBalance = analyticsData?.current_balance || 0
  const totalRecettes = analyticsData?.total_recettes || 0
  const totalDepenses = analyticsData?.total_depenses || 0
  const profitMargin = analyticsData?.profit_margin || 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-neutral-500 mt-1">Analysez vos données financières en détail</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-[#0B177C] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-neutral-500 mt-1">Analysez vos données financières en détail</p>
        {analyticsData && (
          <p className="text-sm text-neutral-400 mt-1">
            Période: {format(new Date(analyticsData.date_from), "dd MMM yyyy", { locale: fr })} -{" "}
            {format(new Date(analyticsData.date_to), "dd MMM yyyy", { locale: fr })}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Solde total"
          value={formatCurrency(currentBalance)}
          icon={TrendingUp}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#0B177C] to-[#0A1259]"
          valueColor="text-neutral-900"
          className="bg-gradient-to-br from-white to-blue-50/30"
        />

        <KPICard
          title="Recettes"
          value={formatCurrency(totalRecettes)}
          icon={ArrowUpRight}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#10B981] to-[#059669]"
          valueColor="text-[#10B981]"
          className="bg-gradient-to-br from-white to-green-50/30"
        />

        <KPICard
          title="Dépenses"
          value={formatCurrency(totalDepenses)}
          icon={ArrowDownRight}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
          valueColor="text-[#EF4444]"
          className="bg-gradient-to-br from-white to-red-50/30"
        />

        <KPICard
          title="Marge"
          value={`${profitMargin.toFixed(1)}%`}
          icon={Percent}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"
          valueColor="text-[#8B5CF6]"
          className="bg-gradient-to-br from-white to-purple-50/30"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <CardTitle className="text-base">Tendances</CardTitle>
              <p className="text-sm text-neutral-500">Évolution des recettes et dépenses</p>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.areaData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-neutral-500">
                Aucune donnée disponible pour cette période
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="recettes"
                      stackId="1"
                      stroke="#10B981"
                      fill="url(#colorRecettes)"
                      name="Recettes"
                    />
                    <Area
                      type="monotone"
                      dataKey="depenses"
                      stackId="2"
                      stroke="#EF4444"
                      fill="url(#colorDepenses)"
                      name="Dépenses"
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B177C]/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#0B177C]" />
            </div>
            <div>
              <CardTitle className="text-base">Répartition</CardTitle>
              <p className="text-sm text-neutral-500">Recettes vs Dépenses</p>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.pieData.every((item) => item.value === 0) ? (
              <div className="h-[250px] flex items-center justify-center text-neutral-500">
                Aucune donnée disponible
              </div>
            ) : (
              <>
                <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {chartData.pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-neutral-600">{item.name}</span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Category Bar Chart */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <CardTitle className="text-base">Par catégorie</CardTitle>
              <p className="text-sm text-neutral-500">Distribution par catégorie</p>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.categoryData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-neutral-500">
                Aucune donnée de catégorie disponible
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      width={120}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

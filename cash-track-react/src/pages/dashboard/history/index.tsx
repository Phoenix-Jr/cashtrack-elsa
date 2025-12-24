import { useState, useMemo } from "react"
import {
  History,
  Clock,
  User,
  Plus,
  Pencil,
  Trash2,
  Filter,
  X,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Store,
  Tag,
  ArrowLeftRight,
  Building2,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Pagination } from "@/components/pagination"
import { KPICard } from "@/components/kpi-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { transactionService, type TransactionHistory } from "@/services/transaction"
import { formatCurrency, formatDate } from "@/lib/format"
import { useQuery } from "@tanstack/react-query"
import { useUIStore } from "@/stores/ui-store"
import { useUsers } from "@/hooks/useUser"
import { useCategories } from "@/hooks/useCategory"

const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100, 200]

export default function HistoryPage() {
  const periodFilter = useUIStore((state) => state.periodFilter)
  const setPeriodFilter = useUIStore((state) => state.setPeriodFilter)
  const { data: usersData } = useUsers()
  const { data: categories = [] } = useCategories()
  
  const [actionFilter, setActionFilter] = useState<"all" | "created" | "updated" | "deleted">("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [showFilters, setShowFilters] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [viewingHistoryItem, setViewingHistoryItem] = useState<TransactionHistory | null>(null)

  const apiFilters = useMemo(() => {
    const filters: any = {
      date_from: periodFilter.from,
      date_to: periodFilter.to,
    }
    
    if (showAll) {
      filters.all = "true"
    } else {
      filters.page = currentPage
      filters.page_size = itemsPerPage
    }
    
    if (actionFilter !== "all") filters.action = actionFilter
    if (userFilter !== "all") filters.user_id = userFilter
    
    return filters
  }, [periodFilter, actionFilter, userFilter, currentPage, itemsPerPage, showAll])

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["transaction-history", apiFilters],
    queryFn: () => transactionService.getHistory(apiFilters),
  })

  const historyItems = historyData?.results || []
  const totalPages = historyData ? Math.ceil(historyData.count / itemsPerPage) : 1
  const stats = historyData?.stats || {
    total_actions: 0,
    created_count: 0,
    updated_count: 0,
    deleted_count: 0,
    total_recettes: 0,
    total_depenses: 0,
  }
  const availableUsers = historyData?.users || []

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (actionFilter !== "all") count++
    if (userFilter !== "all") count++
    return count
  }, [actionFilter, userFilter])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="w-4 h-4" />
      case "updated":
        return <Pencil className="w-4 h-4" />
      case "deleted":
        return <Trash2 className="w-4 h-4" />
      default:
        return <History className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
      case "updated":
        return "bg-[#0B177C]/10 text-[#0B177C] hover:bg-[#0B177C]/20"
      case "deleted":
        return "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
      default:
        return "bg-neutral-100 text-neutral-600"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "Créé"
      case "updated":
        return "Modifié"
      case "deleted":
        return "Supprimé"
      default:
        return action
    }
  }

  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName)
    return cat?.color || "#64748B"
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <History className="w-6 h-6" />
              Historique des transactions
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Journal complet de toutes les opérations (créations, modifications, suppressions) - Lecture seule
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total des actions"
            value={stats.total_actions.toLocaleString("fr-FR")}
            icon={Activity}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#0B177C] to-[#0A1259]"
            valueColor="text-neutral-900"
            description="Toutes les opérations enregistrées"
            className="bg-gradient-to-br from-white to-blue-50/30"
          />
          <KPICard
            title="Créations"
            value={stats.created_count.toLocaleString("fr-FR")}
            icon={Plus}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#10B981] to-[#059669]"
            valueColor="text-[#10B981]"
            description="Transactions créées"
            className="bg-gradient-to-br from-white to-green-50/30"
          />
          <KPICard
            title="Modifications"
            value={stats.updated_count.toLocaleString("fr-FR")}
            icon={Pencil}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#0B177C] to-[#0A1259]"
            valueColor="text-[#0B177C]"
            description="Transactions modifiées"
            className="bg-gradient-to-br from-white to-blue-50/30"
          />
          <KPICard
            title="Suppressions"
            value={stats.deleted_count.toLocaleString("fr-FR")}
            icon={Trash2}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
            valueColor="text-[#EF4444]"
            description="Transactions supprimées"
            className="bg-gradient-to-br from-white to-red-50/30"
          />
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 space-y-4">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`gap-2 bg-transparent ${activeFiltersCount > 0 ? "border-[#0B177C] text-[#0B177C]" : ""}`}
              >
                <Filter className="w-4 h-4" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 bg-[#0B177C] text-white text-xs px-1.5 py-0.5">{activeFiltersCount}</Badge>
                )}
              </Button>
              <Button
                variant={showAll ? "default" : "outline"}
                onClick={() => {
                  setShowAll(!showAll)
                  setCurrentPage(1)
                }}
                className={`gap-2 ${showAll ? "bg-[#0B177C] text-white hover:bg-[#0A1259]" : "bg-transparent"}`}
              >
                <History className="w-4 h-4" />
                {showAll ? "Afficher paginé" : "Afficher tout"}
              </Button>
            </div>

            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Type d'action</label>
                    <Select value={actionFilter} onValueChange={(value: any) => {
                      setActionFilter(value)
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les actions</SelectItem>
                        <SelectItem value="created">Créations</SelectItem>
                        <SelectItem value="updated">Modifications</SelectItem>
                        <SelectItem value="deleted">Suppressions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Utilisateur</label>
                    <Select value={userFilter} onValueChange={(value: string) => {
                      setUserFilter(value)
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les utilisateurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les utilisateurs</SelectItem>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.performed_by__id} value={String(user.performed_by__id)}>
                            {user.performed_by__name} ({user.performed_by__email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* History Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-12 text-neutral-500">Chargement...</div>
              ) : historyItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">Aucun historique trouvé</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Date/Heure</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Action</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Type</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Catégorie</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Description</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Montant</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 hidden lg:table-cell">Référence</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 hidden xl:table-cell">Fournisseur/Client</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Modifications</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Effectué par</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {historyItems.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-neutral-400" />
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {formatDate(item.created_at)}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {new Date(item.created_at).toLocaleTimeString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getActionColor(item.action)} border-0 flex items-center gap-1.5 w-fit`}>
                            {getActionIcon(item.action)}
                            {getActionLabel(item.action)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {item.transaction_data?.type ? (
                            <Badge
                              className={`${
                                item.transaction_data.type === "recette"
                                  ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                                  : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
                              } border-0`}
                            >
                              {item.transaction_data.type === "recette" ? "Entrée" : "Sortie"}
                            </Badge>
                          ) : (
                            <span className="text-sm text-neutral-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.transaction_data?.category_name ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: getCategoryColor(item.transaction_data.category_name) }}
                              />
                              <span className="text-sm text-neutral-700 truncate max-w-[120px]">
                                {item.transaction_data.category_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400 italic">Non défini</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900 max-w-[180px] truncate">
                          {item.transaction_data?.description ? (
                            item.transaction_data.description
                          ) : (
                            <span className="text-neutral-400 italic">Sans description</span>
                          )}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-semibold ${
                            item.transaction_data?.type === "recette" ? "text-[#10B981]" : "text-[#EF4444]"
                          }`}
                        >
                          {item.transaction_data?.amount ? (
                            <>
                              {item.transaction_data.type === "recette" ? "+" : ""}
                              {formatCurrency(Number(item.transaction_data.amount))}
                            </>
                          ) : (
                            <span className="text-neutral-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-500 hidden lg:table-cell">
                          {item.transaction_data?.ref || (
                            <span className="text-neutral-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700 hidden xl:table-cell truncate max-w-[140px]">
                          {item.transaction_data?.exporter_fournisseur || (
                            <span className="text-neutral-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.changes && Object.keys(item.changes).length > 0 ? (
                            <div className="space-y-1 text-xs max-w-[200px]">
                              {Object.entries(item.changes).slice(0, 2).map(([field, change]) => (
                                <div key={field} className="text-neutral-600">
                                  <span className="font-medium capitalize">{field}:</span>{" "}
                                  <span className="text-[#EF4444] line-through">{change.old || "—"}</span>
                                  {" → "}
                                  <span className="text-[#10B981]">{change.new || "—"}</span>
                                </div>
                              ))}
                              {Object.keys(item.changes).length > 2 && (
                                <p className="text-neutral-500 italic">
                                  +{Object.keys(item.changes).length - 2} autre(s)
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.performed_by ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B177C] to-[#0A1259] flex items-center justify-center text-white text-xs font-semibold">
                                {item.performed_by.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate max-w-[80px]">
                                  {item.performed_by.name?.split(" ")[0]}
                                </p>
                                <p className="text-xs text-neutral-500 truncate max-w-[80px]">{item.performed_by.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400 italic">Système</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewingHistoryItem(item)}
                                  className="h-8 w-8 text-neutral-500 hover:text-[#0B177C] hover:bg-[#0B177C]/10"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Voir les détails</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!showAll && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={historyData?.count || 0}
                itemsPerPage={itemsPerPage}
                itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value)
                  setCurrentPage(1)
                }}
                showItemsPerPage={true}
                showPageInput={totalPages > 10}
              />
            )}
            {showAll && historyData && (
              <div className="text-center py-4 text-sm text-neutral-500">
                Affichage de toutes les {historyData.count} entrées d'historique
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Item Details Dialog */}
        <Dialog open={viewingHistoryItem !== null} onOpenChange={() => setViewingHistoryItem(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {viewingHistoryItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Détails de l'historique
                  </DialogTitle>
                  <DialogDescription>
                    Informations complètes de l'action #{viewingHistoryItem.id} sur la transaction #{viewingHistoryItem.transaction_id}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Action Type */}
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-gradient-to-r from-neutral-50 to-white">
                    <div className="flex items-center gap-3">
                      {getActionIcon(viewingHistoryItem.action)}
                      <div>
                        <p className="text-sm text-neutral-500">Action</p>
                        <Badge className={`mt-1 ${getActionColor(viewingHistoryItem.action)} border-0`}>
                          {getActionLabel(viewingHistoryItem.action)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">Date/Heure</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {formatDate(viewingHistoryItem.created_at)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(viewingHistoryItem.created_at).toLocaleTimeString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Data */}
                  {viewingHistoryItem.transaction_data && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type and Amount */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4" />
                            Type et Montant
                          </p>
                          <div className="p-3 rounded-lg bg-neutral-50 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${
                                  viewingHistoryItem.transaction_data.type === "recette"
                                    ? "bg-[#10B981]/10 text-[#10B981]"
                                    : "bg-[#EF4444]/10 text-[#EF4444]"
                                } border-0`}
                              >
                                {viewingHistoryItem.transaction_data.type === "recette" ? "Entrée (Recette)" : "Sortie (Dépense)"}
                              </Badge>
                            </div>
                            <p
                              className={`text-xl font-bold ${
                                viewingHistoryItem.transaction_data.type === "recette" ? "text-[#10B981]" : "text-[#EF4444]"
                              }`}
                            >
                              {viewingHistoryItem.transaction_data.type === "recette" ? "+" : ""}
                              {formatCurrency(Number(viewingHistoryItem.transaction_data.amount || 0))}
                            </p>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Catégorie
                          </p>
                          <div className="p-3 rounded-lg bg-neutral-50">
                            {viewingHistoryItem.transaction_data.category_name ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: getCategoryColor(viewingHistoryItem.transaction_data.category_name) }}
                                />
                                <span className="text-sm text-neutral-700">{viewingHistoryItem.transaction_data.category_name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-neutral-400 italic">Non catégorisé</span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                          <p className="text-sm font-medium text-neutral-700">Description</p>
                          <div className="p-3 rounded-lg bg-neutral-50">
                            <p className="text-sm text-neutral-600">
                              {viewingHistoryItem.transaction_data.description || (
                                <span className="text-neutral-400 italic">Aucune description</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Reference */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4" />
                            Référence / BL
                          </p>
                          <div className="p-3 rounded-lg bg-neutral-50">
                            <p className="text-sm text-neutral-600">
                              {viewingHistoryItem.transaction_data.ref || (
                                <span className="text-neutral-400 italic">Aucune référence</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Exporter/Supplier */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                            {viewingHistoryItem.transaction_data.type === "recette" ? (
                              <Building2 className="w-4 h-4" />
                            ) : (
                              <Truck className="w-4 h-4" />
                            )}
                            {viewingHistoryItem.transaction_data.type === "recette" ? "Exportateur / Client" : "Fournisseur"}
                          </p>
                          <div className="p-3 rounded-lg bg-neutral-50">
                            <p className="text-sm text-neutral-600">
                              {viewingHistoryItem.transaction_data.exporter_fournisseur || (
                                <span className="text-neutral-400 italic">Non renseigné</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Changes */}
                  {viewingHistoryItem.changes && Object.keys(viewingHistoryItem.changes).length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Modifications apportées
                      </p>
                      <div className="p-4 rounded-lg bg-neutral-50 space-y-3">
                        {Object.entries(viewingHistoryItem.changes).map(([field, change]) => (
                          <div key={field} className="p-3 rounded-lg bg-white border border-neutral-200">
                            <p className="text-sm font-medium text-neutral-700 mb-2 capitalize">{field}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex-1 p-2 rounded bg-red-50 border border-red-200">
                                <p className="text-xs text-neutral-500 mb-1">Ancienne valeur</p>
                                <p className="text-[#EF4444] line-through font-medium">{change.old || "—"}</p>
                              </div>
                              <ArrowLeftRight className="w-4 h-4 text-neutral-400" />
                              <div className="flex-1 p-2 rounded bg-green-50 border border-green-200">
                                <p className="text-xs text-neutral-500 mb-1">Nouvelle valeur</p>
                                <p className="text-[#10B981] font-medium">{change.new || "—"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performed By */}
                  <div className="p-4 rounded-xl border-2 border-neutral-200 bg-neutral-50">
                    <p className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Action effectuée par
                    </p>
                    {viewingHistoryItem.performed_by ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B177C] to-[#0A1259] flex items-center justify-center text-white text-lg font-semibold">
                          {viewingHistoryItem.performed_by.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {viewingHistoryItem.performed_by.name}
                          </p>
                          <p className="text-xs text-neutral-500">{viewingHistoryItem.performed_by.email}</p>
                          <p className="text-xs text-neutral-400 mt-1">Rôle: {viewingHistoryItem.performed_by.role}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 italic">Système</p>
                    )}
                  </div>

                  {/* Additional Info for Deleted Transactions */}
                  {viewingHistoryItem.action === "deleted" && viewingHistoryItem.transaction_data && (
                    <div className="p-4 rounded-xl border-2 border-[#EF4444]/20 bg-[#EF4444]/5">
                      <p className="text-sm font-medium text-[#EF4444] mb-2 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Transaction supprimée
                      </p>
                      <div className="space-y-2 text-xs text-neutral-600">
                        {viewingHistoryItem.transaction_data.created_by_name && (
                          <p>
                            <span className="font-medium">Créée par:</span> {viewingHistoryItem.transaction_data.created_by_name}
                          </p>
                        )}
                        {viewingHistoryItem.transaction_data.created_at && (
                          <p>
                            <span className="font-medium">Créée le:</span>{" "}
                            {new Date(viewingHistoryItem.transaction_data.created_at).toLocaleString("fr-FR")}
                          </p>
                        )}
                        {viewingHistoryItem.transaction_data.updated_at && (
                          <p>
                            <span className="font-medium">Modifiée le:</span>{" "}
                            {new Date(viewingHistoryItem.transaction_data.updated_at).toLocaleString("fr-FR")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

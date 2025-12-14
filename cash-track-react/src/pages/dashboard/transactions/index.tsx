import { useState, useMemo, useEffect } from "react"
import {
  Plus,
  Search,
  Download,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  Store,
  User,
  Clock,
  CalendarDays,
  Filter,
  X,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { TransactionModal } from "@/components/transaction-modal"
import { KPICard } from "@/components/kpi-card"
import { Pagination } from "@/components/pagination"
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useTransactionStats } from "@/hooks/useTransaction"
import { useCategories } from "@/hooks/useCategory"
import { useCurrentUser } from "@/hooks/useAuth"
import { useUIStore } from "@/stores/ui-store"
import { formatCurrency, formatDate } from "@/lib/format"
import { exportToExcel, type ExcelColumn } from "@/lib/excel"
import { transactionService } from "@/services/transaction"
import type { Transaction } from "@/types"
import { toast } from "sonner"

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export default function TransactionsPage() {
  const { data: currentUser } = useCurrentUser()
  const isAdmin = currentUser?.role === "admin"
  const isReadOnly = currentUser?.role === "readonly"
  const periodFilter = useUIStore((state) => state.periodFilter)
  const setPeriodFilter = useUIStore((state) => state.setPeriodFilter)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "recette" | "depense">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [authorFilter, setAuthorFilter] = useState<string>("all")
  const [amountMin, setAmountMin] = useState<string>("")
  const [amountMax, setAmountMax] = useState<string>("")

  // Build filters for API
  const apiFilters = useMemo(() => {
    const filters: any = {
      date_from: periodFilter.from,
      date_to: periodFilter.to,
      page: currentPage,
      page_size: itemsPerPage,
    }
    
    if (typeFilter !== "all") filters.type = typeFilter
    if (categoryFilter !== "all") filters.category = categoryFilter
    if (authorFilter !== "all") filters.author = authorFilter
    if (searchQuery) filters.search = searchQuery
    if (amountMin) filters.amount_min = amountMin
    if (amountMax) filters.amount_max = amountMax
    
    return filters
  }, [periodFilter, typeFilter, categoryFilter, authorFilter, searchQuery, amountMin, amountMax, currentPage, itemsPerPage])

  // Reset to page 1 when date filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [periodFilter.from, periodFilter.to])

  const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions(apiFilters)
  const { data: categoriesData } = useCategories()
  const { data: stats } = useTransactionStats({ date_from: periodFilter.from, date_to: periodFilter.to })
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const transactions = transactionsData?.results || []
  const categories = categoriesData || []
  const totalRecettes = stats?.total_recettes || 0
  const totalDepenses = stats?.total_depenses || 0
  const currentBalance = stats?.current_balance || 0

  const uniqueAuthors = useMemo(() => {
    const authors = new Set<string>()
    transactions.forEach((t) => {
      if (t.createdBy) authors.add(t.createdBy)
    })
    return Array.from(authors).sort()
  }, [transactions])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (typeFilter !== "all") count++
    if (categoryFilter !== "all") count++
    if (authorFilter !== "all") count++
    if (periodFilter.from) count++
    if (periodFilter.to) count++
    if (amountMin) count++
    if (amountMax) count++
    return count
  }, [typeFilter, categoryFilter, authorFilter, periodFilter.from, periodFilter.to, amountMin, amountMax])

  const resetFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setAuthorFilter("all")
    setAmountMin("")
    setAmountMax("")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName)
    return cat?.color || "#64748B"
  }

  const handleAddTransaction = async (transaction: Omit<Transaction, "id" | "balance" | "createdBy" | "createdAt">) => {
    const category = categories.find((c) => c.name === transaction.category)
    createMutation.mutate({
      type: transaction.type,
      description: transaction.description || undefined,
      amount: transaction.amount,
      ref: transaction.ref,
      exporter_fournisseur: transaction.exporterFournisseur || undefined,
      category_id: category?.id || null,
    })
    setIsModalOpen(false)
  }

  const handleUpdateTransaction = async (transaction: Omit<Transaction, "id" | "balance" | "createdBy" | "createdAt">) => {
    if (editingTransaction) {
      const category = categories.find((c) => c.name === transaction.category)
      updateMutation.mutate({
        transactionId: editingTransaction.id,
        data: {
          type: transaction.type,
          description: transaction.description || undefined,
          amount: transaction.amount,
          ref: transaction.ref,
          exporter_fournisseur: transaction.exporterFournisseur || undefined,
          category_id: category?.id || null,
        },
      })
      setEditingTransaction(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteTransaction = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId)
      setDeletingId(null)
    }
  }



  const handleExportExcel = async () => {
    try {
      toast.loading("Préparation de l'export Excel...", { id: "export-excel" })
      
      // Récupérer toutes les transactions avec les filtres actuels (sans pagination)
      const exportFilters: any = {
        date_from: periodFilter.from,
        date_to: periodFilter.to,
        page_size: 10000, // Récupérer toutes les transactions
      }
      
      if (typeFilter !== "all") exportFilters.type = typeFilter
      if (categoryFilter !== "all") exportFilters.category = categoryFilter
      if (authorFilter !== "all") exportFilters.author = authorFilter
      if (searchQuery) exportFilters.search = searchQuery
      if (amountMin) exportFilters.amount_min = amountMin
      if (amountMax) exportFilters.amount_max = amountMax

      const allTransactionsData = await transactionService.getAllTransactions(exportFilters)
      const allTransactions = allTransactionsData.results

      // Définir les colonnes pour l'export Excel
      const columns: ExcelColumn[] = [
        { header: "ID", key: "id", width: 10 },
        { header: "DATE DE CRÉATION", key: "createdAt", width: 20 },
        { header: "TYPE", key: "type", width: 12 },
        { header: "CATÉGORIE", key: "category", width: 18 },
        { header: "DESCRIPTION", key: "description", width: 30 },
        { header: "MONTANT", key: "amount", width: 15 },
        { header: "RÉFÉRENCE", key: "ref", width: 15 },
        { header: "EXPORTATEUR/FOURNISSEUR", key: "exporterFournisseur", width: 25 },
        { header: "SOLDE", key: "balance", width: 15 },
        { header: "CRÉÉ PAR", key: "createdBy", width: 18 },
      ]

      // Formater les données pour l'export
      const exportData = allTransactions.map((t) => ({
        id: t.id,
        createdAt: t.createdAt ? formatDate(t.createdAt) : "",
        type: t.type === "recette" ? "Entrée" : "Sortie",
        category: t.category || "Non catégorisé",
        description: t.description || "",
        amount: formatCurrency(t.amount),
        ref: t.ref || "",
        exporterFournisseur: t.exporterFournisseur || "",
        balance: formatCurrency(t.balance),
        createdBy: t.createdBy || "",
      }))

      // Statistiques à inclure
      const statsData = [
        { label: "Total opérations", value: allTransactions.length },
        { label: "Total recettes", value: formatCurrency(totalRecettes) },
        { label: "Total dépenses", value: formatCurrency(totalDepenses) },
        { label: "Solde actuel", value: formatCurrency(currentBalance) },
      ]

      // Générer le titre avec les filtres
      let title = "OPÉRATIONS DE CAISSE"
      if (periodFilter.from || periodFilter.to) {
        const from = periodFilter.from ? formatDate(periodFilter.from) : ""
        const to = periodFilter.to ? formatDate(periodFilter.to) : ""
        title += ` - Période: ${from} ${to ? `au ${to}` : ""}`
      }

      await exportToExcel({
        fileName: "operations_caisse",
        sheetName: "Opérations",
        title,
        columns,
        data: exportData,
        includeStats: true,
        statsData,
      })

      toast.success("Export Excel réussi!", { id: "export-excel" })
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error)
      toast.error("Erreur lors de l'export Excel", { id: "export-excel" })
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const totalPages = Math.ceil((transactionsData?.count || 0) / itemsPerPage)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
              Opérations de Caisse
            </h1>
            <p className="text-neutral-500 mt-1">Enregistrez les entrées et sorties d&apos;argent</p>
          </div>
          {!isReadOnly && (
            <Button
              onClick={() => {
                setEditingTransaction(null)
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-[#0B177C] to-[#0A1259] hover:from-[#0A1259] hover:to-[#0B177C] text-white shadow-lg shadow-[#0B177C]/25 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle opération
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Solde caisse"
            value={formatCurrency(currentBalance)}
            icon={Store}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#0B177C] to-[#0A1259]"
            valueColor="text-neutral-900"
            className="bg-gradient-to-br from-white to-blue-50/30"
          />

          <KPICard
            title="Total opérations"
            value={transactionsData?.count || 0}
            icon={ArrowLeftRight}
            iconColor="text-neutral-600"
            iconBgColor="bg-neutral-100"
            valueColor="text-neutral-900"
            className="bg-gradient-to-br from-white to-neutral-50/30"
          />

          <KPICard
            title="Total entrées"
            value={formatCurrency(totalRecettes)}
            icon={TrendingUp}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#10B981] to-[#059669]"
            valueColor="text-[#10B981]"
            className="bg-gradient-to-br from-white to-green-50/30"
          />

          <KPICard
            title="Total sorties"
            value={formatCurrency(totalDepenses)}
            icon={TrendingDown}
            iconColor="text-white"
            iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
            valueColor="text-[#EF4444]"
            className="bg-gradient-to-br from-white to-red-50/30"
          />
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 space-y-4">
            {/* Main search and filter toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher par description, référence, catégorie, auteur..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>

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
                variant="outline" 
                onClick={handleExportExcel} 
                className="gap-2 bg-transparent border-[#0B177C] text-[#0B177C] hover:bg-[#0B177C] hover:text-white"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </Button>
            </div>

            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-neutral-100">
                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Type d&apos;opération</label>
                    <Select
                      value={typeFilter}
                      onValueChange={(value: "all" | "recette" | "depense") => {
                        setTypeFilter(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes opérations</SelectItem>
                        <SelectItem value="recette">Entrées (Recettes)</SelectItem>
                        <SelectItem value="depense">Sorties (Dépenses)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Catégorie</label>
                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => {
                        setCategoryFilter(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Author Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Auteur</label>
                    <Select
                      value={authorFilter}
                      onValueChange={(value) => {
                        setAuthorFilter(value)
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les auteurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les auteurs</SelectItem>
                        {uniqueAuthors.map((author) => (
                          <SelectItem key={author} value={author}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Min */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Montant min (XOF)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amountMin}
                      onChange={(e) => {
                        setAmountMin(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>

                  {/* Amount Max */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Montant max (XOF)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amountMax}
                      onChange={(e) => {
                        setAmountMax(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                </div>

                {/* Active filters badges */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {typeFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-neutral-200"
                        onClick={() => setTypeFilter("all")}
                      >
                        Type: {typeFilter === "recette" ? "Entrées" : "Sorties"}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {categoryFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-neutral-200"
                        onClick={() => setCategoryFilter("all")}
                      >
                        Catégorie: {categoryFilter}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {authorFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-neutral-200"
                        onClick={() => setAuthorFilter("all")}
                      >
                        Auteur: {authorFilter}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {periodFilter.from && (
                      <Badge variant="secondary" className="gap-1">
                        Depuis: {formatDate(periodFilter.from)}
                      </Badge>
                    )}
                    {periodFilter.to && (
                      <Badge variant="secondary" className="gap-1">
                        Jusqu&apos;à: {formatDate(periodFilter.to)}
                      </Badge>
                    )}
                    {amountMin && (
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-neutral-200"
                        onClick={() => setAmountMin("")}
                      >
                        Min: {formatCurrency(Number.parseFloat(amountMin))}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {amountMax && (
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-neutral-200"
                        onClick={() => setAmountMax("")}
                      >
                        Max: {formatCurrency(Number.parseFloat(amountMax))}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-6 px-2 text-xs text-neutral-500 hover:text-neutral-700"
                    >
                      Tout effacer
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#0B177C] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                      Date de création
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                      Type
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                      Catégorie
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                      Description
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                      Montant
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
                      Référence
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4 hidden xl:table-cell">
                      Exp./Fourn.
                    </th>
                    <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                      Auteur
                    </th>
                    <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-neutral-500">
                        Aucune opération trouvée
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-neutral-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-neutral-700">{transaction.createdAt ? formatDate(transaction.createdAt) : ""}</td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${
                              transaction.type === "recette"
                                ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                                : "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
                            } border-0`}
                          >
                            {transaction.type === "recette" ? "Entrée" : "Sortie"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {transaction.category ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: getCategoryColor(transaction.category) }}
                              />
                              <span className="text-sm text-neutral-700 truncate max-w-[120px]">
                                {transaction.category}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400 italic">Non défini</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900 max-w-[180px] truncate">
                          {transaction.description || (
                            <span className="text-neutral-400 italic">Sans description</span>
                          )}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-semibold ${
                            transaction.type === "recette" ? "text-[#10B981]" : "text-[#EF4444]"
                          }`}
                        >
                          {transaction.type === "recette" ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-500 hidden lg:table-cell">{transaction.ref}</td>
                        <td className="px-6 py-4 text-sm text-neutral-700 hidden xl:table-cell truncate max-w-[140px]">
                          {transaction.exporterFournisseur || (
                            <span className="text-neutral-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {transaction.createdBy ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-default">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B177C] to-[#0A1259] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                    {transaction.createdBy.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-neutral-900 truncate max-w-[80px]">
                                      {transaction.createdBy.split(" ")[0]}
                                    </p>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <div className="space-y-2 p-1">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#0B177C]" />
                                    <span className="font-medium">{transaction.createdBy}</span>
                                  </div>
                                  {transaction.createdAt && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <CalendarDays className="w-4 h-4" />
                                      <span>Créé le {new Date(transaction.createdAt).toLocaleDateString("fr-FR")}</span>
                                    </div>
                                  )}
                                  {transaction.createdAt && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      <span>à {new Date(transaction.createdAt).toLocaleTimeString("fr-FR")}</span>
                                    </div>
                                  )}
                                  {transaction.category && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Tag className="w-4 h-4" />
                                      <span>{transaction.category}</span>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-neutral-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!isReadOnly && (isAdmin || transaction.createdById === currentUser?.id) && (
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(isAdmin || transaction.createdById === currentUser?.id) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingTransaction(transaction)
                                    setIsModalOpen(true)
                                  }}
                                  className="h-8 w-8 text-neutral-500 hover:text-[#0B177C] hover:bg-[#0B177C]/10"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingId(transaction.id)}
                                  className="h-8 w-8 text-neutral-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          )}
                          {(isReadOnly || (!isAdmin && transaction.createdById !== currentUser?.id)) && (
                            <div className="text-xs text-neutral-400 italic text-right">Lecture seule</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={transactionsData?.count || 0}
            itemsPerPage={itemsPerPage}
            itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            showPageInput={totalPages > 10}
          />
        </Card>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTransaction(null)
          }}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          transaction={editingTransaction}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette opération ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTransaction}
                className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

import { useState, useMemo } from "react"
import { Plus, FolderOpen, Pencil, Trash2, ShoppingBag, Briefcase, Package, Home, Users, Zap, X, BarChart3, Search, Filter, TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KPICard } from "@/components/kpi-card"
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
import { useCategoriesWithStats, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategory"
import { useCurrentUser } from "@/hooks/useAuth"
import type { Category } from "@/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Briefcase,
  Package,
  Home,
  Users,
  Zap,
  FolderOpen,
}

const colorOptions = [
  { value: "#10B981", label: "Vert" },
  { value: "#0B177C", label: "Bleu" },
  { value: "#8B5CF6", label: "Violet" },
  { value: "#F59E0B", label: "Orange" },
  { value: "#EF4444", label: "Rouge" },
  { value: "#EC4899", label: "Rose" },
]

const iconOptions = ["ShoppingBag", "Briefcase", "Package", "Home", "Users", "Zap", "FolderOpen"]

export default function CategoriesPage() {
  const { data: currentUser } = useCurrentUser()
  const isAdmin = currentUser?.role === "admin"
  const isReadOnly = currentUser?.role === "readonly"
  const { data: categoriesData, isLoading } = useCategoriesWithStats()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const categories = categoriesData?.categories || []
  const totalTransactions = categoriesData?.total_transactions || 0

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "recette" | "depense" | "both">("all")
  const [formData, setFormData] = useState({
    name: "",
    type: "both" as "recette" | "depense" | "both",
    color: "#0B177C",
    icon: "FolderOpen",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "all" || category.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [categories, searchQuery, typeFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const recetteCategories = categories.filter((c) => c.type === "recette" || c.type === "both").length
    const depenseCategories = categories.filter((c) => c.type === "depense" || c.type === "both").length
    const totalRecettes = categories
      .filter((c) => c.type === "recette" || c.type === "both")
      .reduce((sum, c) => sum + ((c as any).transaction_count || 0), 0)
    const totalDepenses = categories
      .filter((c) => c.type === "depense" || c.type === "both")
      .reduce((sum, c) => sum + ((c as any).transaction_count || 0), 0)

    return {
      total: categories.length,
      recetteCategories,
      depenseCategories,
      totalRecettes,
      totalDepenses,
    }
  }, [categories])

  const openModal = (category?: Category) => {
    setFormErrors({})
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: "", type: "both", color: "#0B177C", icon: "FolderOpen" })
    }
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = "Le nom de la catégorie est requis"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères"
    } else if (formData.name.trim().length > 50) {
      errors.name = "Le nom ne peut pas dépasser 50 caractères"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          categoryId: editingCategory.id,
          data: formData,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      setIsModalOpen(false)
      setFormErrors({})
    } catch (error) {
      console.error("Error submitting category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId)
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
            Catégories
          </h1>
          <p className="text-neutral-500 mt-1">Organisez vos transactions par catégorie</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
            Catégories
          </h1>
          <p className="text-neutral-500 mt-1">Organisez vos transactions par catégorie</p>
          {totalTransactions > 0 && (
            <p className="text-sm text-neutral-400 mt-1">
              {totalTransactions} transaction{totalTransactions > 1 ? "s" : ""} au total
            </p>
          )}
        </div>
        {isAdmin && !isReadOnly && (
          <Button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total catégories"
          value={stats.total}
          icon={FolderOpen}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"
          valueColor="text-neutral-900"
          className="bg-gradient-to-br from-white to-purple-50/30"
        />
        <KPICard
          title="Catégories recettes"
          value={stats.recetteCategories}
          icon={TrendingUp}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#10B981] to-[#059669]"
          valueColor="text-[#10B981]"
          className="bg-gradient-to-br from-white to-green-50/30"
        />
        <KPICard
          title="Catégories dépenses"
          value={stats.depenseCategories}
          icon={TrendingDown}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
          valueColor="text-[#EF4444]"
          className="bg-gradient-to-br from-white to-red-50/30"
        />
        <KPICard
          title="Transactions"
          value={totalTransactions}
          icon={BarChart3}
          iconColor="text-white"
          iconBgColor="bg-gradient-to-br from-[#0B177C] to-[#0A1259]"
          valueColor="text-neutral-900"
          className="bg-gradient-to-br from-white to-blue-50/30"
        />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-400" />
                  <SelectValue placeholder="Filtrer par type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="recette">Recettes uniquement</SelectItem>
                <SelectItem value="depense">Dépenses uniquement</SelectItem>
                <SelectItem value="both">Les deux</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length === 0 && categories.length > 0 ? (
          <Card className="border-0 shadow-md md:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune catégorie trouvée</h3>
              <p className="text-neutral-500">Essayez de modifier vos critères de recherche</p>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category) => {
          const Icon = iconMap[category.icon] || FolderOpen
          const transactionCount = (category as any).transaction_count || 0
          const percentage = (category as any).percentage || 0

          return (
            <Card
              key={category.id}
              className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <div style={{ color: category.color }}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-neutral-900 truncate">{category.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-xs ${
                        category.type === "recette"
                          ? "border-[#10B981]/30 text-[#10B981]"
                          : category.type === "depense"
                            ? "border-[#EF4444]/30 text-[#EF4444]"
                            : "border-[#8B5CF6]/30 text-[#8B5CF6]"
                      }`}
                    >
                      {category.type === "both" ? "Les deux" : category.type === "recette" ? "Recette" : "Dépense"}
                    </Badge>
                  </div>
                </div>
                {isAdmin && !isReadOnly && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(category)}
                      className="h-8 w-8 text-neutral-500 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(category.id)}
                      className="h-8 w-8 text-neutral-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {isReadOnly && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50">
                    Lecture seule
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">
                      {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-neutral-900">{percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
        )}
      </div>

      {categories.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune catégorie</h3>
            <p className="text-neutral-500 mb-4">Créez votre première catégorie pour organiser vos transactions</p>
            {isAdmin && (
              <Button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une catégorie
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-xl font-semibold text-neutral-900">
                {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category-name" className="text-neutral-700">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: "" })
                    }
                  }}
                  placeholder="Ex: Ventes"
                  className={`h-11 ${formErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  required
                  maxLength={50}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {formErrors.name}
                  </p>
                )}
                <p className="text-xs text-neutral-400">{formData.name.length}/50 caractères</p>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["recette", "depense", "both"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.type === type
                          ? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6]"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {type === "both" ? "Les deux" : type === "recette" ? "Recette" : "Dépense"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        formData.color === color.value ? "ring-2 ring-offset-2 ring-neutral-400 scale-110" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icône</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => {
                    const Icon = iconMap[icon]
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          formData.icon === icon
                            ? "bg-[#8B5CF6]/10 text-[#8B5CF6] ring-2 ring-[#8B5CF6]"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false)
                    setFormErrors({})
                  }}
                  className="flex-1 h-11 bg-transparent"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingCategory ? "Modification..." : "Ajout..."}
                    </>
                  ) : (
                    editingCategory ? "Modifier" : "Ajouter"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#EF4444] hover:bg-[#DC2626] text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

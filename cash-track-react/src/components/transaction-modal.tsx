import { useState, useEffect, useMemo } from "react"
import { X, TrendingUp, TrendingDown, Building2, Truck, Search, Check, Tag, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCategories } from "@/hooks/useCategory"
import type { Transaction } from "@/types"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    transaction: Omit<Transaction, "id" | "balance" | "createdBy" | "createdAt" | "modifiedBy" | "modifiedAt">,
  ) => void
  transaction?: Transaction | null
}

export function TransactionModal({ isOpen, onClose, onSubmit, transaction }: TransactionModalProps) {
  const { data: categories = [] } = useCategories()

  const [formData, setFormData] = useState({
    type: "recette" as "recette" | "depense",
    description: "",
    amount: "",
    ref: "",
    exporterFournisseur: "",
    category: "",
  })

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => c.type === formData.type || c.type === "both")
      .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
  }, [categories, formData.type, categorySearch])

  const selectedCategory = categories.find((c) => c.name === formData.category)

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        description: transaction.description,
        amount: Math.abs(transaction.amount).toString(),
        ref: transaction.ref,
        exporterFournisseur: transaction.exporterFournisseur,
        category: transaction.category || "",
      })
    } else {
      setFormData({
        type: "recette",
        description: "",
        amount: "",
        ref: "",
        exporterFournisseur: "",
        category: "",
      })
    }
    setCategorySearch("")
  }, [transaction, isOpen])

  const handleTypeChange = (newType: "recette" | "depense") => {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "")
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const prefix = newType === "recette" ? "VTE" : "ACH"

    setFormData({
      ...formData,
      type: newType,
      ref: transaction ? formData.ref : `${prefix}-${today}-${randomNum}`,
      category: "",
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0"
    }

    // Référence n'est plus obligatoire, mais si elle est remplie, elle doit avoir au moins 3 caractères
    if (formData.ref && formData.ref.trim() !== "" && formData.ref.trim().length < 3) {
      newErrors.ref = "La référence doit contenir au moins 3 caractères"
    }

    if (!formData.category) {
      newErrors.category = "Veuillez sélectionner une catégorie"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const amount = Number.parseFloat(formData.amount)
      await onSubmit({
        type: formData.type,
        description: formData.description || undefined,
        amount: formData.type === "depense" ? -Math.abs(amount) : Math.abs(amount),
        ref: formData.ref?.trim() || undefined,
        exporterFournisseur: formData.exporterFournisseur?.trim() || undefined,
        category: formData.category,
      })
      onClose()
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-neutral-900">
            {transaction ? "Modifier l'opération" : "Nouvelle opération de caisse"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("recette")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                formData.type === "recette"
                  ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="font-semibold">Entrée (Recette)</span>
              <span className="text-xs opacity-70">Encaissement client</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("depense")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                formData.type === "depense"
                  ? "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <TrendingDown className="w-6 h-6" />
              <span className="font-semibold">Sortie (Dépense)</span>
              <span className="text-xs opacity-70">Paiement fournisseur</span>
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Catégorie <span className="text-red-500">*</span>
            </Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full h-11 justify-between font-normal bg-transparent ${
                    errors.category ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                >
                  {selectedCategory ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                      {selectedCategory.name}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sélectionner une catégorie...</span>
                  )}
                  <Search className="w-4 h-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une catégorie..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune catégorie trouvée</p>
                  ) : (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          handleFieldChange("category", cat.name)
                          setCategoryOpen(false)
                          setCategorySearch("")
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-neutral-100 transition-colors ${
                          formData.category === cat.name ? "bg-neutral-100" : ""
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="flex-1 text-left">{cat.name}</span>
                        {formData.category === cat.name && <Check className="w-4 h-4 text-[#10B981]" />}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {errors.category && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-neutral-700">
              Description <span className="text-neutral-400 text-xs font-normal">(optionnel)</span>
            </Label>
            <Input
              id="description"
              placeholder={
                formData.type === "recette" ? "Ex: Vente de marchandises - Lot A" : "Ex: Achat de stock - Fournitures"
              }
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-neutral-700">
              Montant (XOF) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => handleFieldChange("amount", e.target.value)}
                className={`h-11 pr-10 ${errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                min="0"
                step="1"
                required
              />
              {errors.amount && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.amount}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref" className="text-neutral-700">
              Référence / numéro BL <span className="text-neutral-400 text-xs font-normal">(optionnel)</span>
            </Label>
            <div className="relative">
              <Input
                id="ref"
                placeholder={formData.type === "recette" ? "Ex: VTE-20250110-001 / BL-001" : "Ex: ACH-20250110-001 / BL-001"}
                value={formData.ref}
                onChange={(e) => handleFieldChange("ref", e.target.value)}
                className={`h-11 ${errors.ref ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.ref && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
            {errors.ref && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.ref}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="exporterFournisseur" className="text-neutral-700 flex items-center gap-2">
              {formData.type === "recette" ? (
                <>
                  <Building2 className="w-4 h-4" />
                  Exportateur / Client
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Fournisseur
                </>
              )}
              <span className="text-neutral-400 text-xs font-normal">(optionnel)</span>
            </Label>
            <Input
              id="exporterFournisseur"
              placeholder={formData.type === "recette" ? "Nom de l'exportateur ou du client" : "Nom du fournisseur"}
              value={formData.exporterFournisseur}
              onChange={(e) => handleFieldChange("exporterFournisseur", e.target.value)}
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 bg-transparent">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 h-11 text-white ${
                formData.type === "recette"
                  ? "bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981]"
                  : "bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#EF4444]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {transaction ? "Modification..." : "Enregistrement..."}
                </>
              ) : (
                transaction ? "Modifier" : "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


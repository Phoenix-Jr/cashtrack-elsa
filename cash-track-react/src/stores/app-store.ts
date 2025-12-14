import { create } from "zustand"
import type { Transaction, Category, User, Permission } from "@/types"
import { apiClient } from "@/services/api"
import { toast } from "sonner"

// Role permissions mapping
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    "view_dashboard",
    "manage_transactions",
    "manage_categories",
    "manage_users",
    "view_analytics",
    "view_reports",
    "manage_settings",
  ],
  user: ["view_dashboard", "manage_transactions", "view_analytics"],
  readonly: ["view_dashboard", "view_analytics", "view_reports"],
}

interface AppState {
  // Auth state
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean

  // Data
  transactions: Transaction[]
  categories: Category[]
  users: User[]

  // UI State
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
  periodFilter: { from: string; to: string }

  // Computed values
  currentBalance: number
  totalRecettes: number
  totalDepenses: number
  todayRecettes: number
  todayDepenses: number

  // Loading states
  isLoading: boolean
  isInitialized: boolean

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  initialize: () => Promise<void>

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, "id" | "balance" | "createdBy" | "createdAt">) => Promise<void>
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  fetchTransactions: (params?: any) => Promise<void>

  // Category actions
  addCategory: (category: Omit<Category, "id">) => Promise<void>
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  fetchCategories: () => Promise<void>

  // User actions
  addUser: (user: Omit<User, "id">) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  fetchUsers: () => Promise<void>

  // Stats actions
  fetchStats: () => Promise<void>
  fetchDashboardStats: () => Promise<void>

  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setPeriodFilter: (from: string, to: string) => void
}

// Helper function to get current month period
const getCurrentMonthPeriod = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  return {
    from: firstDay.toISOString().split("T")[0],
    to: lastDay.toISOString().split("T")[0],
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  transactions: [],
  categories: [],
  users: [],
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  periodFilter: getCurrentMonthPeriod(),
  currentBalance: 0,
  totalRecettes: 0,
  totalDepenses: 0,
  todayRecettes: 0,
  todayDepenses: 0,
  isLoading: false,
  isInitialized: false,

  // Auth actions
  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true })
    try {
      const response = await apiClient.login(email, password)
      if (response.data) {
        const user = response.data.user
        set({
          user: {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            createdAt: user.created_at,
          },
          isAuthenticated: true,
          isAdmin: user.role === "admin",
          isLoading: false,
        })
        // Initialize data after login
        await get().initialize()
        return true
      } else {
        set({ isLoading: false })
        const errorMsg = (response as any).error || (response as any).data?.error || "Erreur de connexion"
        toast.error(errorMsg)
        return false
      }
    } catch (error: any) {
      set({ isLoading: false })
      const errorMessage = error?.response?.data?.error || error?.message || "Erreur de connexion"
      toast.error(errorMessage)
      console.error("Login error:", error)
      return false
    }
  },

  logout: async () => {
    await apiClient.logout()
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      transactions: [],
      categories: [],
      users: [],
      isInitialized: false,
    })
  },

  hasPermission: (permission: Permission): boolean => {
    const { user } = get()
    if (!user || !user.role) return false
    const permissions = rolePermissions[user.role] || []
    return permissions.includes(permission)
  },

  initialize: async () => {
    if (get().isInitialized) return
    
    set({ isLoading: true })
    try {
      await Promise.all([
        get().fetchCategories(),
        get().fetchTransactions(),
        get().fetchDashboardStats(),
      ])
      
      // Fetch users if admin
      if (get().isAdmin) {
        await get().fetchUsers()
      }
      
      set({ isInitialized: true, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error("Error initializing:", error)
    }
  },

  // Transaction actions
  fetchTransactions: async (params?: any) => {
    set({ isLoading: true })
    try {
      const periodFilter = get().periodFilter
      const queryParams = new URLSearchParams()
      const filters = {
        ...params,
        date_from: params?.date_from !== undefined ? params.date_from : (periodFilter.from || undefined),
        date_to: params?.date_to !== undefined ? params.date_to : (periodFilter.to || undefined),
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })
      
      const response = await apiClient.get(`/transactions/?${queryParams.toString()}`)

      if (response.data) {
        const transactions = Array.isArray(response.data.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : []

        const formattedTransactions = transactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          description: t.description,
          amount: Number(t.amount),
          ref: t.ref,
          exporterFournisseur: t.exporter_fournisseur,
          balance: Number(t.balance),
          category: t.category?.name,
          createdBy: t.created_by?.name,
          createdAt: t.created_at,
          modifiedBy: t.modified_by?.name,
          modifiedAt: t.modified_at,
        }))

        set({ transactions: formattedTransactions })
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.post("/transactions/", {
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        ref: transaction.ref,
        exporter_fournisseur: transaction.exporterFournisseur,
        category_id: transaction.category ? await getCategoryId(transaction.category) : null,
      })

      if (response.data) {
        toast.success("Opération de caisse enregistrée")
        await get().fetchTransactions()
        await get().fetchDashboardStats()
      } else {
        toast.error("Erreur lors de l'ajout")
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout")
    } finally {
      set({ isLoading: false })
    }
  },

  updateTransaction: async (id, updates) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.patch(`/transactions/${id}/`, {
        type: updates.type,
        description: updates.description,
        amount: updates.amount,
        ref: updates.ref,
        exporter_fournisseur: updates.exporterFournisseur,
        category_id: updates.category ? await getCategoryId(updates.category) : null,
      })

      if (response.data) {
        toast.success("Opération modifiée avec succès")
        await get().fetchTransactions()
        await get().fetchDashboardStats()
      } else {
        toast.error("Erreur lors de la modification")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    } finally {
      set({ isLoading: false })
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.delete(`/transactions/${id}/`)
      if (!response.error) {
        toast.success("Opération supprimée")
        await get().fetchTransactions()
        await get().fetchDashboardStats()
      } else {
        toast.error(response.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      set({ isLoading: false })
    }
  },

  // Category actions
  fetchCategories: async () => {
    try {
      const response = await apiClient.getCategories()
      if (response.data) {
        const categories = Array.isArray(response.data.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : []

        const formattedCategories = categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
        }))

        set({ categories: formattedCategories })
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.createCategory(category)
      if (response.data) {
        toast.success("Catégorie ajoutée avec succès")
        await get().fetchCategories()
      } else {
        toast.error("Erreur lors de l'ajout")
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout")
    } finally {
      set({ isLoading: false })
    }
  },

  updateCategory: async (id, updates) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.updateCategory(id, updates)
      if (response.data) {
        toast.success("Catégorie modifiée avec succès")
        await get().fetchCategories()
      } else {
        toast.error("Erreur lors de la modification")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    } finally {
      set({ isLoading: false })
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true })
    try {
      await apiClient.deleteCategory(id)
      toast.success("Catégorie supprimée")
      await get().fetchCategories()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      set({ isLoading: false })
    }
  },

  // User actions
  fetchUsers: async () => {
    if (!get().isAdmin) return
    
    try {
      const response = await apiClient.getUsers()
      if (response.data) {
        const users = Array.isArray(response.data.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : []

        const formattedUsers = users.map((u: any) => ({
          id: String(u.id),
          email: u.email,
          name: u.name,
          role: u.role,
          status: u.status,
          createdAt: u.created_at,
        }))

        set({ users: formattedUsers })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  },

  addUser: async (newUser) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.createUser(newUser)
      if (response.data) {
        toast.success("Utilisateur ajouté avec succès")
        await get().fetchUsers()
      } else {
        toast.error("Erreur lors de l'ajout")
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout")
    } finally {
      set({ isLoading: false })
    }
  },

  updateUser: async (id, updates) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.updateUser(Number(id), updates)
      if (response.data) {
        toast.success("Utilisateur modifié avec succès")
        await get().fetchUsers()
      } else {
        toast.error("Erreur lors de la modification")
      }
    } catch (error) {
      toast.error("Erreur lors de la modification")
    } finally {
      set({ isLoading: false })
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true })
    try {
      await apiClient.deleteUser(Number(id))
      toast.success("Utilisateur supprimé")
      await get().fetchUsers()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      set({ isLoading: false })
    }
  },

  // Stats actions
  fetchStats: async () => {
    try {
      const periodFilter = get().periodFilter
      const queryParams = new URLSearchParams()
      if (periodFilter.from) queryParams.append("date_from", periodFilter.from)
      if (periodFilter.to) queryParams.append("date_to", periodFilter.to)
      
      const response = await apiClient.get(`/transactions/stats/?${queryParams.toString()}`)

      if (response.data) {
        set({
          currentBalance: response.data.current_balance || 0,
          totalRecettes: response.data.total_recettes || 0,
          totalDepenses: response.data.total_depenses || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  },

  fetchDashboardStats: async () => {
    try {
      const response = await apiClient.get("/transactions/dashboard-stats/")
      if (response.data) {
        set({
          currentBalance: response.data.current_balance || 0,
          totalRecettes: response.data.total_recettes || 0,
          totalDepenses: response.data.total_depenses || 0,
          todayRecettes: response.data.today_recettes || 0,
          todayDepenses: response.data.today_depenses || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  },

  // UI actions
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open })
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
  },

  setPeriodFilter: (from, to) => {
    set({ periodFilter: { from, to } })
    // Refetch transactions when period changes
    get().fetchTransactions()
    get().fetchStats()
  },
}))

// Helper function to get category ID from name
async function getCategoryId(categoryName: string): Promise<number | null> {
  const { categories } = useAppStore.getState()
  const category = categories.find((c) => c.name === categoryName)
  return category?.id || null
}


import { create } from "zustand"
import type { Transaction, Category, User, Permission } from "@/types"

const generateTransactions = (categories: Category[]): Transaction[] => {
  const descriptions = {
    recette: [
      "Vente de marchandises",
      "Encaissement client",
      "Vente comptoir",
      "Vente en gros",
      "Paiement facture client",
      "Vente au détail",
      "Commande spéciale",
      "Vente produits frais",
      "Encaissement chèque",
      "Vente exportation",
    ],
    depense: [
      "Achat de stock",
      "Loyer mensuel",
      "Facture électricité",
      "Salaires employés",
      "Fournitures bureau",
      "Frais transport",
      "Entretien matériel",
      "Assurance magasin",
      "Frais bancaires",
      "Achat équipement",
    ],
  }

  const exporters = [
    "Exportateur ABC",
    "Exportateur DEF",
    "Exportateur GHI",
    "Exportateur JKL",
    "Exportateur MNO",
    "Client Premium SA",
    "Commerce Plus",
    "Distribution Express",
    "Négoce International",
    "Export Direct",
  ]

  const fournisseurs = [
    "Fournisseur XYZ",
    "Grossiste Central",
    "Import Global",
    "Fournitures Pro",
    "Stock Express",
    "Matériaux Plus",
    "Distribution SA",
    "CIE Électricité",
    "Propriétaire Immeuble",
    "Personnel Magasin",
  ]

  const users = ["Admin User", "Manager User", "Regular User"]
  const transactions: Transaction[] = []

  const recetteCategories = categories.filter((c) => c.type === "recette" || c.type === "both")
  const depenseCategories = categories.filter((c) => c.type === "depense" || c.type === "both")

  for (let i = 0; i < 60; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const isRecette = Math.random() > 0.45

    const type = isRecette ? "recette" : "depense"
    const descList = descriptions[type]
    const description = descList[Math.floor(Math.random() * descList.length)]
    const amount = isRecette
      ? Math.floor(Math.random() * 2000000) + 100000
      : -(Math.floor(Math.random() * 800000) + 50000)

    const refPrefix = isRecette ? "VTE" : "DEP"
    const ref = `${refPrefix}-${dateStr.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`

    const exporterFournisseur = isRecette
      ? exporters[Math.floor(Math.random() * exporters.length)]
      : fournisseurs[Math.floor(Math.random() * fournisseurs.length)]

    const categoryList = isRecette ? recetteCategories : depenseCategories
    const category = categoryList[Math.floor(Math.random() * categoryList.length)]?.name || "Divers"

    const createdBy = users[Math.floor(Math.random() * users.length)]
    const hour = Math.floor(Math.random() * 10) + 8
    const minute = Math.floor(Math.random() * 60)
    const createdAt = `${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`

    transactions.push({
      id: i + 1,
      type,
      description: `${description} - Réf. ${i + 1}`,
      amount,
      ref,
      exporterFournisseur,
      category,
      balance: 0,
      createdBy,
      createdAt,
    })
  }

  transactions.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
  let runningBalance = 5000000
  transactions.forEach((t) => {
    runningBalance += t.amount
    t.balance = runningBalance
  })

  return transactions
}

const generateUsers = (): User[] => {
  const firstNames = [
    "Jean",
    "Marie",
    "Pierre",
    "Sophie",
    "Paul",
    "Claire",
    "Marc",
    "Anne",
    "Luc",
    "Julie",
    "Thomas",
    "Emma",
    "Nicolas",
    "Sarah",
    "David",
    "Laura",
    "François",
    "Camille",
    "Antoine",
    "Léa",
  ]
  const lastNames = [
    "Dupont",
    "Martin",
    "Bernard",
    "Petit",
    "Robert",
    "Richard",
    "Durand",
    "Leroy",
    "Moreau",
    "Simon",
    "Laurent",
    "Michel",
    "Garcia",
    "Thomas",
    "Roux",
  ]

  const users: User[] = [
    {
      id: "1",
      email: "admin@cashtrack.com",
      name: "Admin User",
      role: "admin",
      status: "active",
      createdAt: "2025-01-01",
    },
    {
      id: "2",
      email: "manager@cashtrack.com",
      name: "Manager User",
      role: "admin",
      status: "active",
      createdAt: "2025-01-05",
    },
    {
      id: "3",
      email: "user@cashtrack.com",
      name: "Regular User",
      role: "user",
      status: "active",
      createdAt: "2025-01-10",
    },
  ]

  for (let i = 4; i <= 25; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@cashtrack.com`
    const roles: Array<"admin" | "user"> = ["user", "user", "user", "admin"]
    const role = roles[Math.floor(Math.random() * roles.length)]
    const statuses: Array<"active" | "inactive"> = ["active", "active", "active", "inactive"]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))
    const createdAt = date.toISOString().split("T")[0]

    users.push({
      id: String(i),
      email,
      name,
      role,
      status,
      createdAt,
    })
  }

  return users
}

const initialCategories: Category[] = [
  { id: 1, name: "Ventes", type: "recette", color: "#10B981", icon: "ShoppingBag" },
  { id: 2, name: "Services", type: "recette", color: "#0B177C", icon: "Briefcase" },
  { id: 3, name: "Encaissements", type: "recette", color: "#06B6D4", icon: "Wallet" },
  { id: 4, name: "Fournitures", type: "depense", color: "#F59E0B", icon: "Package" },
  { id: 5, name: "Loyer", type: "depense", color: "#EF4444", icon: "Home" },
  { id: 6, name: "Salaires", type: "depense", color: "#8B5CF6", icon: "Users" },
  { id: 7, name: "Utilities", type: "depense", color: "#EC4899", icon: "Zap" },
  { id: 8, name: "Transport", type: "depense", color: "#F97316", icon: "Truck" },
  { id: 9, name: "Maintenance", type: "depense", color: "#6366F1", icon: "Wrench" },
  { id: 10, name: "Divers", type: "both", color: "#64748B", icon: "MoreHorizontal" },
]

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
  user: ["view_dashboard", "manage_transactions", "view_analytics", "view_reports"],
  readonly: ["view_dashboard", "view_analytics", "view_reports"],
}

interface AppState {
  // Auth
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

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: Permission) => boolean

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, "id" | "balance" | "createdBy" | "createdAt">) => void
  updateTransaction: (id: number, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: number) => void

  // Category actions
  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: number, category: Partial<Category>) => void
  deleteCategory: (id: number) => void

  // User actions
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void

  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setPeriodFilter: (from: string, to: string) => void
}

const recalculateBalances = (txns: Transaction[]): Transaction[] => {
  const sorted = [...txns].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
  let runningBalance = 5000000
  return sorted.map((t) => {
    runningBalance += t.amount
    return { ...t, balance: runningBalance }
  })
}

const computeValues = (transactions: Transaction[]) => {
  const today = new Date().toISOString().split("T")[0]
  const sorted = [...transactions].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  const latestBalance = sorted.length > 0 ? sorted[0].balance : 0

  const recettes = transactions.filter((t) => t.type === "recette").reduce((sum, t) => sum + t.amount, 0)
  const depenses = transactions.filter((t) => t.type === "depense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const todayTxns = transactions.filter((t) => t.createdAt?.startsWith(today))
  const todayRec = todayTxns.filter((t) => t.type === "recette").reduce((sum, t) => sum + t.amount, 0)
  const todayDep = todayTxns.filter((t) => t.type === "depense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    currentBalance: latestBalance,
    totalRecettes: recettes,
    totalDepenses: depenses,
    todayRecettes: todayRec,
    todayDepenses: todayDep,
  }
}

const initialTransactions = generateTransactions(initialCategories)
const initialUsers = generateUsers()
const initialComputed = computeValues(initialTransactions)

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
  transactions: initialTransactions,
  categories: initialCategories,
  users: initialUsers,
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  periodFilter: getCurrentMonthPeriod(),
  ...initialComputed,

  // Auth actions
  login: async (email: string, password: string): Promise<boolean> => {
    const foundUser = initialUsers.find((u) => u.email === email)
    if (email && password && foundUser) {
      set({
        user: foundUser,
        isAuthenticated: true,
        isAdmin: foundUser.role === "admin",
      })
      return true
    }
    return false
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    })
  },

  hasPermission: (permission: Permission): boolean => {
    const { user } = get()
    if (!user || !user.role) return false
    const permissions = rolePermissions[user.role] || []
    return permissions.includes(permission)
  },

  // Transaction actions
  addTransaction: (transaction) => {
    const { user, transactions } = get()
    const newId = Math.max(...transactions.map((t) => t.id), 0) + 1
    const newTxn: Transaction = {
      ...transaction,
      id: newId,
      balance: 0,
      createdBy: user?.name || "Utilisateur inconnu",
      createdAt: new Date().toISOString(),
    }
    const updated = recalculateBalances([...transactions, newTxn])
    set({ transactions: updated, ...computeValues(updated) })
  },

  updateTransaction: (id, updates) => {
    const { user, transactions } = get()
    const updated = transactions.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updates,
            modifiedBy: user?.name || "Utilisateur inconnu",
            modifiedAt: new Date().toISOString(),
          }
        : t,
    )
    const recalculated = recalculateBalances(updated)
    set({ transactions: recalculated, ...computeValues(recalculated) })
  },

  deleteTransaction: (id) => {
    const { transactions } = get()
    const filtered = transactions.filter((t) => t.id !== id)
    const recalculated = recalculateBalances(filtered)
    set({ transactions: recalculated, ...computeValues(recalculated) })
  },

  // Category actions
  addCategory: (category) => {
    const { categories } = get()
    const newId = Math.max(...categories.map((c) => c.id), 0) + 1
    set({ categories: [...categories, { ...category, id: newId }] })
  },

  updateCategory: (id, updates) => {
    const { categories } = get()
    set({ categories: categories.map((c) => (c.id === id ? { ...c, ...updates } : c)) })
  },

  deleteCategory: (id) => {
    const { categories } = get()
    set({ categories: categories.filter((c) => c.id !== id) })
  },

  // User actions
  addUser: (newUser) => {
    const { users } = get()
    const maxId = Math.max(...users.map((u) => Number.parseInt(u.id)), 0)
    const newId = String(maxId + 1)
    set({
      users: [...users, { ...newUser, id: newId, createdAt: new Date().toISOString().split("T")[0] }],
    })
  },

  updateUser: (id, updates) => {
    const { users } = get()
    set({ users: users.map((u) => (u.id === id ? { ...u, ...updates } : u)) })
  },

  deleteUser: (id) => {
    const { users } = get()
    set({ users: users.filter((u) => u.id !== id) })
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
  },
}))


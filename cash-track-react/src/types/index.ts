export interface Transaction {
  id: number
  type: "recette" | "depense"
  description?: string | null
  amount: number
  ref: string
  exporterFournisseur?: string | null
  balance: number
  category?: string
  createdBy?: string
  createdById?: string
  createdAt?: string
  modifiedBy?: string
  modifiedAt?: string
}

export interface Category {
  id: number
  name: string
  type: "recette" | "depense" | "both"
  color: string
  icon: string
}

export interface User {
  id: string
  email: string
  name?: string
  role?: "admin" | "user" | "readonly"
  status?: "active" | "inactive"
  createdAt?: string
  isSuperuser?: boolean
}

export type Permission =
  | "view_dashboard"
  | "manage_transactions"
  | "manage_categories"
  | "manage_users"
  | "view_analytics"
  | "view_reports"
  | "manage_settings"

export type Page =
  | "login"
  | "dashboard"
  | "transactions"
  | "categories"
  | "analytics"
  | "reports"
  | "settings"
  | "users"


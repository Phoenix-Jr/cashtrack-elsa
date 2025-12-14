import { useAppStore } from "@/stores/app-store"

export function useAuth() {
  const user = useAppStore((state) => state.user)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const login = useAppStore((state) => state.login)
  const logout = useAppStore((state) => state.logout)

  return { user, isAuthenticated, login, logout }
}


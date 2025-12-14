import { useAppStore } from "@/stores/app-store"

export function useTransactions() {
  const transactions = useAppStore((state) => state.transactions)
  const addTransaction = useAppStore((state) => state.addTransaction)
  const updateTransaction = useAppStore((state) => state.updateTransaction)
  const deleteTransaction = useAppStore((state) => state.deleteTransaction)
  const currentBalance = useAppStore((state) => state.currentBalance)
  const totalRecettes = useAppStore((state) => state.totalRecettes)
  const totalDepenses = useAppStore((state) => state.totalDepenses)

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    currentBalance,
    totalRecettes,
    totalDepenses,
  }
}


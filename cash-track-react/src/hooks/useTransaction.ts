import { transactionService } from "@/services/transaction";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
} from "@/services/transaction";

// 📋 Récupérer toutes les transactions
export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionService.getAllTransactions(filters),
  });
};

// 📄 Récupérer une transaction par ID
export const useTransaction = (transactionId: number) => {
  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => transactionService.getTransactionById(transactionId),
    enabled: !!transactionId,
  });
};

// ➕ Créer une transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: CreateTransactionDto) =>
      transactionService.createTransaction(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["categories", "stats"] });
      toast.success("Opération de caisse enregistrée");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la création de l'opération"
      );
    },
  });
};

// ✏️ Mettre à jour une transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: number;
      data: UpdateTransactionDto;
    }) => transactionService.updateTransaction(transactionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["categories", "stats"] });
      toast.success("Opération modifiée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la modification de l'opération"
      );
    },
  });
};

// 🗑️ Supprimer une transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: number) =>
      transactionService.deleteTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["categories", "stats"] });
      toast.success("Opération supprimée");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la suppression de l'opération"
      );
    },
  });
};

// 📊 Récupérer les statistiques des transactions
export const useTransactionStats = (params?: { date_from?: string; date_to?: string }) => {
  return useQuery({
    queryKey: ["transactionStats", params],
    queryFn: () => transactionService.getStats(params),
  });
};

// 📈 Récupérer les statistiques du dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => transactionService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// 📊 Récupérer les données analytics
export const useAnalytics = (params?: { date_from?: string; date_to?: string }) => {
  return useQuery({
    queryKey: ["analytics", params],
    queryFn: () => transactionService.getAnalytics(params),
  });
};

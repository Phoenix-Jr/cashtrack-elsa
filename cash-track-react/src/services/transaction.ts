import type { Transaction } from "@/types";
import { apiClient } from "./api";

export interface CreateTransactionDto {
  type: "recette" | "depense";
  description: string;
  amount: number;
  ref: string;
  exporter_fournisseur: string;
  category_id?: number | null;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface TransactionStats {
  current_balance: number;
  total_recettes: number;
  total_depenses: number;
  transaction_count: number;
}

export interface DashboardStats extends TransactionStats {
  today_recettes: number;
  today_depenses: number;
}

export interface AnalyticsData {
  area_data: Array<{
    date: string;
    recettes: number;
    depenses: number;
  }>;
  category_data: Array<{
    name: string;
    value: number;
    color: string;
    recettes: number;
    depenses: number;
  }>;
  total_recettes: number;
  total_depenses: number;
  current_balance: number;
  transaction_count: number;
  profit_margin: number;
  date_from: string;
  date_to: string;
}

export interface TransactionFilters {
  type?: "recette" | "depense";
  category?: string;
  author?: string;
  date_from?: string;
  date_to?: string;
  created_at_from?: string;
  created_at_to?: string;
  updated_at_from?: string;
  updated_at_to?: string;
  amount_min?: string;
  amount_max?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const transactionService = {
  getAllTransactions: async (filters?: TransactionFilters): Promise<{
    results: Transaction[];
    count: number;
    next: string | null;
    previous: string | null;
  }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await apiClient.get(`/transactions/?${params.toString()}`);
    
    // Handle both paginated and non-paginated responses
    if (response.data.results) {
      return {
        results: response.data.results.map(formatTransaction),
        count: response.data.count || response.data.results.length,
        next: response.data.next || null,
        previous: response.data.previous || null,
      };
    }
    
    // Non-paginated response
    const transactions = Array.isArray(response.data) ? response.data : [];
    return {
      results: transactions.map(formatTransaction),
      count: transactions.length,
      next: null,
      previous: null,
    };
  },

  getTransactionById: async (transactionId: number): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${transactionId}/`);
    return formatTransaction(response.data);
  },

  createTransaction: async (transaction: CreateTransactionDto): Promise<Transaction> => {
    const response = await apiClient.post("/transactions/", transaction);
    return formatTransaction(response.data);
  },

  updateTransaction: async (
    transactionId: number,
    transaction: UpdateTransactionDto
  ): Promise<Transaction> => {
    const response = await apiClient.patch(`/transactions/${transactionId}/`, transaction);
    return formatTransaction(response.data);
  },

  deleteTransaction: async (transactionId: number): Promise<void> => {
    await apiClient.delete(`/transactions/${transactionId}/`);
  },

  getStats: async (params?: { date_from?: string; date_to?: string }): Promise<TransactionStats> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    const response = await apiClient.get(`/transactions/stats/?${queryParams.toString()}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/transactions/dashboard-stats/");
    return response.data;
  },

  getAnalytics: async (params?: { date_from?: string; date_to?: string }): Promise<AnalyticsData> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    const response = await apiClient.get(`/transactions/analytics/?${queryParams.toString()}`);
    return response.data;
  },
};

function formatTransaction(data: any): Transaction {
  return {
    id: data.id,
    type: data.type,
    description: data.description || null,
    amount: Number(data.amount),
    ref: data.ref,
    exporterFournisseur: data.exporter_fournisseur || null,
    balance: Number(data.balance),
    category: data.category?.name,
    createdBy: data.created_by?.name,
    createdById: data.created_by?.id ? String(data.created_by.id) : undefined,
    createdAt: data.created_at,
    modifiedBy: data.modified_by?.name,
    modifiedAt: data.modified_at,
  };
}

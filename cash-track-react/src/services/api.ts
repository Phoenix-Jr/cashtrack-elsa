import axios, { type AxiosInstance, type AxiosError } from "axios";

// Token storage utility with better validation
class TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  setTokens(access: string | null, refresh: string | null) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== "undefined") {
      if (access) {
        localStorage.setItem("access_token", access);
      } else {
        localStorage.removeItem("access_token");
      }
      if (refresh) {
        localStorage.setItem("refresh_token", refresh);
      } else {
        localStorage.removeItem("refresh_token");
      }
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken && typeof window !== "undefined") {
      this.refreshToken = localStorage.getItem("refresh_token");
    }
    return this.refreshToken;
  }

  clear() {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshPromise = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      // Add 30 seconds buffer to avoid edge cases
      return payload.exp > currentTime + 30;
    } catch {
      return false;
    }
  }

  // Prevent multiple simultaneous refresh requests
  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/auth/refresh/`,
        { refresh: refreshToken }
      );

      if (response.data.access) {
        this.setTokens(response.data.access, refreshToken);
        return response.data.access;
      }

      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clear();
      return null;
    }
  }
}

const tokenStorage = new TokenStorage();

export class ApiClientError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Create axios instance
// Use relative URL if VITE_API_URL is not set or if it's the same origin
// This allows nginx proxy to handle API requests
const getApiBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.startsWith('/')) {
    return envUrl; // Use full URL if provided
  }
  // Use relative URL to leverage nginx proxy
  return envUrl || "/api";
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000,
  withCredentials: false,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = tokenStorage.getAccessToken();
  
  // If we have a token but it's not valid, try to refresh
  if (token && !tokenStorage.isTokenValid()) {
    const newToken = await tokenStorage.refreshAccessToken();
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`;
    }
  } else if (token && tokenStorage.isTokenValid()) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await tokenStorage.refreshAccessToken();

      if (newToken) {
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } else {
        // Refresh failed, redirect to login
        tokenStorage.clear();

        // Only redirect if we're in a browser environment
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Utility function to determine error type for UI components
export function getErrorType(
  error: any
): "network" | "server" | "not-found" | "generic" {
  if (error instanceof ApiClientError) {
    switch (error.code) {
      case "NETWORK_ERROR":
      case "TIMEOUT_ERROR":
        return "network";
      case "NOT_FOUND":
        return "not-found";
      case "INTERNAL_SERVER_ERROR":
      case "SERVICE_UNAVAILABLE":
        return "server";
      default:
        return "generic";
    }
  }
  return "generic";
}

// Interface for report metadata
export interface ReportMetadata {
  id: number
  filename: string
  format_type: "pdf" | "xlsx"
  report_type: "daily" | "weekly" | "monthly" | "yearly" | "custom"
  date_from: string
  date_to: string
  generated_by: {
    id: number | null
    name: string | null
    email: string | null
  }
  generated_at: string
  transaction_count: number
  total_recettes: number
  total_depenses: number
  balance: number
  download_count: number
  last_downloaded_at: string | null
  last_downloaded_by: {
    id: number | null
    name: string | null
    email: string | null
  } | null
  file_exists: boolean
  download_url: string
}

// Helper function to list all reports with pagination
export async function listReports(
  params?: {
    format?: string
    type?: string
    page?: number
    page_size?: number
  }
): Promise<{
  results: ReportMetadata[]
  count: number
  next: string | null
  previous: string | null
}> {
  let token = tokenStorage.getAccessToken()
  if (!token || !tokenStorage.isTokenValid()) {
    token = await tokenStorage.refreshAccessToken()
    if (!token) {
      throw new Error("Not authenticated. Please login again.")
    }
  }

  const queryParams = new URLSearchParams()
  if (params?.format) queryParams.append("format", params.format)
  if (params?.type) queryParams.append("type", params.type)
  if (params?.page) queryParams.append("page", String(params.page))
  if (params?.page_size) queryParams.append("page_size", String(params.page_size))

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
  const url = `${apiUrl}/transactions/reports/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.detail || `Failed to list reports: ${response.statusText}`)
    }

    const data = await response.json()
    // Handle both paginated and non-paginated responses
    if (data.results) {
      return {
        results: data.results,
        count: data.count || data.results.length,
        next: data.next || null,
        previous: data.previous || null,
      }
    }
    // Non-paginated response (backward compatibility)
    return {
      results: Array.isArray(data) ? data : [],
      count: Array.isArray(data) ? data.length : 0,
      next: null,
      previous: null,
    }
  } catch (error) {
    console.error("Error listing reports:", error)
    throw error
  }
}

// Helper function to download an existing report by ID
export async function downloadReportById(reportId: number): Promise<void> {
  let token = tokenStorage.getAccessToken()
  if (!token || !tokenStorage.isTokenValid()) {
    token = await tokenStorage.refreshAccessToken()
    if (!token) {
      throw new Error("Not authenticated. Please login again.")
    }
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
  const url = `${apiUrl}/transactions/reports/${reportId}/download/`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.detail || `Failed to download report: ${response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || (!contentType.includes("pdf") && !contentType.includes("spreadsheet") && !contentType.includes("octet-stream"))) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.detail || "Invalid response format")
    }

    const blob = await response.blob()
    if (!blob || blob.size === 0) {
      throw new Error("Empty file received")
    }

    const contentDisposition = response.headers.get("content-disposition")
    let filename = `report_${reportId}.pdf`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "")
        // Handle UTF-8 encoded filenames
        if (filename.startsWith("UTF-8''")) {
          filename = decodeURIComponent(filename.replace("UTF-8''", ""))
        }
      }
    }

    const url_blob = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url_blob
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url_blob)
  } catch (error) {
    console.error("Error downloading report:", error)
    throw error
  }
}

// Helper function to generate and download a new report
export async function downloadReport(
  format: "pdf" | "xlsx",
  reportType: "daily" | "weekly" | "monthly" | "annual" | "custom",
  dateFrom?: string,
  dateTo?: string
): Promise<void> {
  // Ensure token is valid
  let token = tokenStorage.getAccessToken();
  if (!token || !tokenStorage.isTokenValid()) {
    token = await tokenStorage.refreshAccessToken();
    if (!token) {
      throw new Error("Not authenticated. Please login again.");
    }
  }

  const params = new URLSearchParams({
    format,
    type: reportType,
  });

  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const url = `${apiUrl}/transactions/reports/generate/?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // Check if response is ok
    if (!response.ok) {
      // Try to parse error message from JSON response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `Failed to download report: ${response.statusText}`);
      }
      throw new Error(`Failed to download report: ${response.status} ${response.statusText}`);
    }

    // Check if response is actually a file (blob)
    const contentType = response.headers.get("content-type");
    if (!contentType || (!contentType.includes("pdf") && !contentType.includes("spreadsheet") && !contentType.includes("octet-stream"))) {
      // Might be an error response
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.detail || "Unknown error occurred");
      } catch {
        throw new Error(`Unexpected response format: ${text.substring(0, 100)}`);
      }
    }

    const blob = await response.blob();
    
    // Check if blob is empty or too small (might be an error)
    if (blob.size < 100) {
      const text = await blob.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.detail || "Report file is empty");
      } catch {
        throw new Error("Report file is too small or invalid");
      }
    }

    // Create download link
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    
    // Get filename from content-disposition header or generate one
    const contentDisposition = response.headers.get("content-disposition");
    let filename = `rapport_${reportType}_${new Date().toISOString().split("T")[0]}.${format}`;
    if (contentDisposition) {
      // Try multiple patterns to extract filename
      const patterns = [
        /filename\*=UTF-8''(.+?)(?:;|$)/i,
        /filename\*?=['"]?([^'";\n]+)['"]?/i,
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i,
      ];
      
      for (const pattern of patterns) {
        const match = contentDisposition.match(pattern);
        if (match && match[1]) {
          try {
            filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
          } catch {
            filename = match[1].replace(/['"]/g, "");
          }
          break;
        }
      }
    }
    
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error: any) {
    console.error("Download report error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error?.message || "Failed to download report");
  }
}

// Helper function to save report metadata to database
export async function saveReportMetadata(data: {
  report_type: "daily" | "weekly" | "monthly" | "annual" | "custom"
  date_from: string
  date_to: string
  transaction_count: number
  total_recettes: number
  total_depenses: number
  balance: number
  format_type?: "pdf" | "xlsx"
  filename?: string
}): Promise<ReportMetadata> {
  let token = tokenStorage.getAccessToken()
  if (!token || !tokenStorage.isTokenValid()) {
    token = await tokenStorage.refreshAccessToken()
    if (!token) {
      throw new Error("Not authenticated. Please login again.")
    }
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
  const url = `${apiUrl}/transactions/reports/create/`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        report_type: data.report_type === "annual" ? "yearly" : data.report_type,
        date_from: data.date_from,
        date_to: data.date_to,
        transaction_count: data.transaction_count,
        total_recettes: data.total_recettes,
        total_depenses: data.total_depenses,
        balance: data.balance,
        format_type: data.format_type || "xlsx",
        filename: data.filename,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.detail || `Failed to save report: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error saving report metadata:", error)
    throw error
  }
}

// Create a wrapper with convenience methods
const apiClientWrapper = {
  ...apiClient,
  
  // Expose axios methods directly
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  
  // Auth methods
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login/", { email, password });
      if (response.data.access && response.data.refresh) {
        tokenStorage.setTokens(response.data.access, response.data.refresh);
      }
      return response;
    } catch (error: any) {
      // Handle error response
      if (error.response?.data) {
        throw new ApiClientError(
          error.response.data.error || error.response.data.detail || "Erreur de connexion",
          error.response.status,
          error.response.data.code,
          error.response.data
        );
      }
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await apiClient.post("/auth/logout/");
    } finally {
      tokenStorage.clear();
    }
  },
  
  // Category methods
  getCategories: async () => {
    const response = await apiClient.get("/categories/");
    const categories = response.data.results || (Array.isArray(response.data) ? response.data : []);
    return { data: categories };
  },
  
  createCategory: async (category: any) => {
    return await apiClient.post("/categories/", category);
  },
  
  updateCategory: async (id: number, category: any) => {
    return await apiClient.patch(`/categories/${id}/`, category);
  },
  
  deleteCategory: async (id: number) => {
    return await apiClient.delete(`/categories/${id}/`);
  },
  
  // User methods
  getUsers: async () => {
    const response = await apiClient.get("/auth/users/");
    const users = response.data.results || (Array.isArray(response.data) ? response.data : []);
    return { data: users };
  },
  
  createUser: async (user: any) => {
    return await apiClient.post("/auth/users/", user);
  },
  
  updateUser: async (id: number, user: any) => {
    return await apiClient.patch(`/auth/users/${id}/`, user);
  },
  
  deleteUser: async (id: number) => {
    return await apiClient.delete(`/auth/users/${id}/`);
  },
  
  // Transaction methods
  getTransactions: async (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, String(params[key]));
        }
      });
    }
    return await apiClient.get(`/transactions/?${queryParams.toString()}`);
  },
  
  createTransaction: async (transaction: any) => {
    return await apiClient.post("/transactions/", transaction);
  },
  
  updateTransaction: async (id: number, transaction: any) => {
    return await apiClient.patch(`/transactions/${id}/`, transaction);
  },
  
  deleteTransaction: async (id: number) => {
    return await apiClient.delete(`/transactions/${id}/`);
  },
  
  getTransactionStats: async (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, String(params[key]));
        }
      });
    }
    return await apiClient.get(`/transactions/stats/?${queryParams.toString()}`);
  },
  
  getDashboardStats: async () => {
    return await apiClient.get("/transactions/dashboard-stats/");
  },
};

export { apiClientWrapper as apiClient, tokenStorage };

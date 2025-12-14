import type { User } from "@/types";
import { apiClient, tokenStorage } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login/", credentials);

    if (response.data.access && response.data.refresh) {
      tokenStorage.setTokens(response.data.access, response.data.refresh);
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout/");
    } finally {
      tokenStorage.clear();
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/auth/me/");
    const userData = response.data;
    
    return {
      id: String(userData.id),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      status: userData.status,
      createdAt: userData.created_at,
    };
  },

  refreshToken: async (): Promise<{ access: string }> => {
    const response = await apiClient.post("/auth/refresh/", {
      refresh: tokenStorage.getRefreshToken(),
    });
    
    if (response.data.access) {
      tokenStorage.setTokens(response.data.access, tokenStorage.getRefreshToken());
    }
    
    return response.data;
  },
};


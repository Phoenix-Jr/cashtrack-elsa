import type { User } from "@/types";
import { apiClient } from "./api";

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role?: "admin" | "user" | "readonly";
  status?: "active" | "inactive";
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  password?: string;
}

export const userService = {
  getAllUsers: async (): Promise<{ data: User[]; total: number }> => {
    const response = await apiClient.get("/auth/users/");
    
    // Handle both paginated and non-paginated responses
    const users = response.data.results || (Array.isArray(response.data) ? response.data : []);
    
    return {
      data: users.map(formatUser),
      total: response.data.count || users.length,
    };
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/auth/users/${userId}/`);
    return formatUser(response.data);
  },

  createUser: async (user: CreateUserDto): Promise<User> => {
    const response = await apiClient.post("/auth/users/", user);
    return formatUser(response.data);
  },

  updateUser: async (userId: string, user: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch(`/auth/users/${userId}/`, user);
    return formatUser(response.data);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/auth/users/${userId}/`);
  },

  changePassword: async (userId: string, password: string): Promise<void> => {
    await apiClient.post(`/auth/users/${userId}/change-password/`, { password });
  },

  toggleStatus: async (userId: string): Promise<{ status: string }> => {
    const response = await apiClient.post(`/auth/users/${userId}/toggle-status/`);
    return response.data;
  },
};

function formatUser(data: any): User {
  return {
    id: String(data.id),
    email: data.email,
    name: data.name,
    role: data.role,
    status: data.status,
    createdAt: data.created_at,
    isSuperuser: data.is_superuser || false,
  };
}


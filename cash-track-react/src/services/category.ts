import type { Category } from "@/types";
import { apiClient } from "./api";

export interface CreateCategoryDto {
  name: string;
  type: "recette" | "depense" | "both";
  color: string;
  icon: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryWithStats extends Category {
  transaction_count: number;
  percentage: number;
}

export interface CategoryStatsResponse {
  count: number;
  total_transactions: number;
  categories: CategoryWithStats[];
}

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get("/categories/");
    
    // Handle both paginated and non-paginated responses
    const categories = response.data.results || (Array.isArray(response.data) ? response.data : []);
    
    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    }));
  },

  getCategoriesWithStats: async (): Promise<CategoryStatsResponse> => {
    const response = await apiClient.get("/categories/stats/");
    return {
      count: response.data.count,
      total_transactions: response.data.total_transactions,
      categories: response.data.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        icon: cat.icon,
        transaction_count: cat.transaction_count || 0,
        percentage: cat.percentage || 0,
      })),
    };
  },

  getCategoryById: async (categoryId: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${categoryId}/`);
    const cat = response.data;
    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    };
  },

  createCategory: async (category: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post("/categories/", category);
    const cat = response.data;
    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    };
  },

  updateCategory: async (
    categoryId: number,
    category: UpdateCategoryDto
  ): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${categoryId}/`, category);
    const cat = response.data;
    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    };
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}/`);
  },
};

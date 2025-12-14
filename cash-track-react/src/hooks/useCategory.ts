import { categoryService } from "@/services/category";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateCategoryDto, UpdateCategoryDto } from "@/services/category";

// 📋 Récupérer toutes les catégories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAllCategories,
  });
};

// 📊 Récupérer toutes les catégories avec statistiques
export const useCategoriesWithStats = () => {
  return useQuery({
    queryKey: ["categories", "stats"],
    queryFn: categoryService.getCategoriesWithStats,
  });
};

// 📄 Récupérer une catégorie par ID
export const useCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => categoryService.getCategoryById(categoryId),
    enabled: !!categoryId,
  });
};

// ➕ Créer une catégorie
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CreateCategoryDto) => categoryService.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", "stats"] });
      toast.success("Catégorie ajoutée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la création de la catégorie"
      );
    },
  });
};

// ✏️ Mettre à jour une catégorie
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: UpdateCategoryDto }) =>
      categoryService.updateCategory(categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.categoryId] });
      toast.success("Catégorie modifiée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la modification de la catégorie"
      );
    },
  });
};

// 🗑️ Supprimer une catégorie
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => categoryService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", "stats"] });
      toast.success("Catégorie supprimée");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la suppression de la catégorie"
      );
    },
  });
};

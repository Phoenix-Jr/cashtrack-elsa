import { userService } from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateUserDto, UpdateUserDto } from "@/services/user";

// 📋 Récupérer tous les utilisateurs
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: userService.getAllUsers,
  });
};

// 📄 Récupérer un utilisateur par ID
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });
};

// ➕ Créer un utilisateur
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: CreateUserDto) => userService.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur ajouté avec succès");
    },
    onError: (error: any) => {
      // Don't show toast here - let the component handle error display in the form
      // Only show toast for non-validation errors
      const errorData = error?.response?.data;
      if (!errorData?.error && !errorData?.password && !errorData?.email) {
        toast.error(
          errorData?.message || "Erreur lors de la création de l'utilisateur"
        );
      }
    },
  });
};

// ✏️ Mettre à jour un utilisateur
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserDto }) =>
      userService.updateUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      toast.success("Utilisateur modifié avec succès");
    },
    onError: (error: any) => {
      // Don't show toast here - let the component handle error display in the form
      // Only show toast for non-validation errors
      const errorData = error?.response?.data;
      if (!errorData?.email && !errorData?.name && !errorData?.role && !errorData?.status) {
        toast.error(
          errorData?.error || errorData?.message || "Erreur lors de la modification de l'utilisateur"
        );
      }
    },
  });
};

// 🗑️ Supprimer un utilisateur
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur supprimé");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur"
      );
    },
  });
};

// 🔑 Changer le mot de passe d'un utilisateur
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      userService.changePassword(userId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Toast will be shown in the component's onSuccess callback
    },
    onError: (error: any) => {
      // Don't show toast here - let the component handle error display in the form
      // The component will show detailed password validation errors
    },
  });
};

// 🔄 Toggle le statut d'un utilisateur
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.toggleStatus(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Utilisateur ${data.status === "active" ? "activé" : "désactivé"} avec succès`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Erreur lors de la modification du statut"
      );
    },
  });
};


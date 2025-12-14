import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginCredentials, LoginResponse } from "@/services/auth";
import { authService } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// 👤 Récupérer l'utilisateur connecté
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getCurrentUser,
    retry: false, // Ne pas réessayer si l'utilisateur n'est pas connecté
  });
};

// 🔐 Se connecter
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      // Mettre en cache l'utilisateur connecté
      queryClient.setQueryData(["currentUser"], data.user);
      navigate("/dashboard");
      toast.success("Connexion réussie");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error?.response?.data?.message || "Erreur de connexion";
      toast.error(message);
    },
  });
};

// 🚪 Se déconnecter
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      toast.success("Déconnexion réussie");
      // Nettoyer tout le cache après déconnexion
      queryClient.clear();
      navigate("/auth/login");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Une erreur s'est produite lors de la déconnexion");
    },
  });
};


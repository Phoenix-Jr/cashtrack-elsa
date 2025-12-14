import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Configuration simple du QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Données toujours fraîches
      retry: 1, // 1 seul retry
      refetchOnWindowFocus: false, // Pas de refetch au focus
      refetchOnMount: true, // Refetch au montage
      gcTime: 5 * 60 * 1000, // Cache 5 minutes
    },
    mutations: {
      retry: 0, // Pas de retry pour les mutations
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);


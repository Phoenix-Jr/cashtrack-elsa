import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { listReports, downloadReportById, downloadReport, saveReportMetadata, type ReportMetadata } from "@/services/api"
import { toast } from "sonner"

// Hook pour lister les rapports sauvegardés
export function useReports(params?: { format?: string; type?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => listReports(params),
    staleTime: 30000, // 30 secondes
  })
}

// Hook pour télécharger un rapport sauvegardé
export function useDownloadSavedReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportId: number) => {
      try {
        await downloadReportById(reportId)
        return reportId
      } catch (error: any) {
        throw new Error(error?.message || "Erreur lors du téléchargement du rapport")
      }
    },
    onSuccess: (reportId) => {
      toast.success("Rapport téléchargé avec succès")
      // Invalider le cache pour mettre à jour les stats de téléchargement
      queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du téléchargement")
    },
  })
}

// Hook pour générer et télécharger un rapport depuis le backend
export function useGenerateBackendReport() {
  return useMutation({
    mutationFn: async ({
      format,
      reportType,
      dateFrom,
      dateTo,
    }: {
      format: "pdf" | "xlsx"
      reportType: "daily" | "weekly" | "monthly" | "annual" | "custom"
      dateFrom?: string
      dateTo?: string
    }) => {
      try {
        await downloadReport(format, reportType, dateFrom, dateTo)
        return { format, reportType, dateFrom, dateTo }
      } catch (error: any) {
        throw new Error(error?.message || "Erreur lors de la génération du rapport")
      }
    },
    onSuccess: () => {
      toast.success("Rapport généré et téléchargé avec succès")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la génération")
    },
  })
}

// Hook pour sauvegarder les métadonnées d'un rapport en DB
export function useSaveReportMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      report_type: "daily" | "weekly" | "monthly" | "annual" | "custom"
      date_from: string
      date_to: string
      transaction_count: number
      total_recettes: number
      total_depenses: number
      balance: number
      format_type?: "pdf" | "xlsx"
      filename?: string
    }) => {
      try {
        const result = await saveReportMetadata(data)
        return result
      } catch (error: any) {
        throw new Error(error?.message || "Erreur lors de la sauvegarde du rapport")
      }
    },
    onSuccess: () => {
      // Invalider le cache pour mettre à jour la liste des rapports
      queryClient.invalidateQueries({ queryKey: ["reports"] })
    },
    onError: (error: Error) => {
      console.error("Error saving report metadata:", error)
      // Ne pas afficher de toast d'erreur ici, laisser l'appelant gérer
    },
  })
}


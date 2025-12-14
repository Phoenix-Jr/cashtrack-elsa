import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  itemsPerPageOptions?: number[]
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  showPageInput?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsPerPageOptions = [10, 25, 50, 100],
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInput = true,
  className,
}: PaginationProps) {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.currentTarget
      const page = parseInt(input.value)
      if (page >= 1 && page <= totalPages) {
        onPageChange(page)
        input.value = ""
      }
    }
  }

  if (totalPages === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50", className)}>
      {/* Left side - Info and items per page */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-neutral-600">
            Affichage de <span className="font-semibold text-neutral-900">{startItem}</span> à{" "}
            <span className="font-semibold text-neutral-900">{endItem}</span> sur{" "}
            <span className="font-semibold text-neutral-900">{totalItems.toLocaleString()}</span> résultats
          </p>
        </div>

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Afficher</span>
            <Select value={String(itemsPerPage)} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
              <SelectTrigger className="w-[80px] h-9 border-neutral-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-neutral-600">par page</span>
          </div>
        )}
      </div>

      {/* Right side - Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* First page button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-9 w-9 border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Première page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 w-9 border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                    ...
                  </span>
                )
              }

              const pageNum = page as number
              const isActive = currentPage === pageNum

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    "h-9 w-9 font-medium transition-all",
                    isActive
                      ? "bg-[#0B177C] hover:bg-[#0A1259] text-white shadow-sm"
                      : "border-neutral-200 hover:bg-neutral-100 hover:border-[#0B177C]/30"
                  )}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 w-9 border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-9 w-9 border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Dernière page"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>

          {/* Page input (optional) */}
          {showPageInput && totalPages > 10 && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-neutral-200">
              <span className="text-sm text-neutral-600">Aller à</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                placeholder={String(currentPage)}
                onKeyDown={handlePageInput}
                className="w-16 h-9 text-center border-neutral-200"
              />
              <span className="text-sm text-neutral-600">/ {totalPages}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


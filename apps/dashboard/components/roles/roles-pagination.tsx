"use client";

import { useTranslations } from "next-intl";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRolesStore } from "@/store/roles-store";

export function RolesPagination() {
  const t = useTranslations("Pagination");
  const { currentPage, paginationData, setCurrentPage } = useRolesStore();
  
  // If there's only one page, don't show pagination
  if (paginationData.totalPages <= 1) {
    return null;
  }

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const totalPages = paginationData.totalPages;
    const currentPageNum = currentPage;
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, currentPageNum - 1); i <= Math.min(totalPages - 1, currentPageNum + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Sort and deduplicate
    return [...new Set(pageNumbers)].sort((a, b) => a - b);
  };
  
  const pageNumbers = getPageNumbers();
  
  // Calculate pagination info
  const startItem = (currentPage - 1) * paginationData.limit + 1;
  const endItem = Math.min(currentPage * paginationData.limit, paginationData.total);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        {t("showing")} <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> {t("of")} <span className="font-medium">{paginationData.total}</span> {t("items")}
      </div>
      
      <Pagination className="order-1 sm:order-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {pageNumbers.map((pageNumber, index) => {
            // Check if we need to show ellipsis
            const showEllipsis = index > 0 && pageNumber - pageNumbers[index - 1] > 1;
            
            return (
              <div key={pageNumber} className="flex items-center">
                {showEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNumber);
                    }}
                    isActive={pageNumber === currentPage}
                    className={pageNumber === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              </div>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < paginationData.totalPages) {
                  setCurrentPage(currentPage + 1);
                }
              }}
              aria-disabled={currentPage >= paginationData.totalPages}
              className={currentPage >= paginationData.totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

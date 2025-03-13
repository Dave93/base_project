"use client";

import { useTranslations } from "next-intl";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePermissionsStore } from "@/store/permissions-store";

export function PermissionsPagination() {
  const t = useTranslations("Permissions");
  const paginationData = usePermissionsStore((state) => state.paginationData);
  const currentPage = usePermissionsStore((state) => state.currentPage);
  const setCurrentPage = usePermissionsStore((state) => state.setCurrentPage);

  if (paginationData.totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Function to determine which page numbers to show
  const getPageNumbers = () => {
    const totalPages = paginationData.totalPages;
    const current = currentPage;
    
    // If 7 or fewer pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first and last page
    const pages: (number | 'ellipsis')[] = [1];
    
    // Logic for showing pages around current page
    if (current <= 3) {
      // Near the start
      pages.push(2, 3, 4, 'ellipsis', totalPages);
    } else if (current >= totalPages - 2) {
      // Near the end
      pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Middle - show current page and neighbors
      pages.push('ellipsis', current - 1, current, current + 1, 'ellipsis', totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (currentPage > 1) {
                handlePageChange(currentPage - 1);
              }
            }}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            aria-disabled={currentPage <= 1}
          />
        </PaginationItem>
        
        {pageNumbers.map((page, i) => 
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (currentPage < paginationData.totalPages) {
                handlePageChange(currentPage + 1);
              }
            }}
            className={currentPage >= paginationData.totalPages ? "pointer-events-none opacity-50" : ""}
            aria-disabled={currentPage >= paginationData.totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

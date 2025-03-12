"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPermissions, PermissionsResponse } from "@/lib/permissions";
import { usePermissionsStore } from "@/store/permissions-store";
import {
  PermissionsHeader,
  PermissionsTable,
  PermissionsPagination,
  PermissionFormDialog
} from "@/components/permissions";

export default function PermissionsPage() {
  // Clean up store when component unmounts
  useEffect(() => {
    return () => {
      usePermissionsStore.getState().reset();
    };
  }, []);

  // Get current page from store for data fetching only
  const currentPage = usePermissionsStore((state) => state.currentPage);
  
  // Query to fetch permissions
  const { data, isLoading } = useQuery<PermissionsResponse | null>({
    queryKey: ["permissions", currentPage],
    queryFn: () => getPermissions(currentPage, 10)
  });

  // Update pagination data in store when data changes
  const setPaginationData = usePermissionsStore((state) => state.setPaginationData);
  useEffect(() => {
    if (data?.pagination) {
      setPaginationData(data.pagination);
    }
  }, [data?.pagination, setPaginationData]);

  const permissions = data?.permissions || [];

  return (
    <>
      <PermissionsHeader />

      <PermissionsTable
        permissions={permissions}
        isLoading={isLoading}
      />

      <PermissionsPagination />

      <PermissionFormDialog />
    </>
  );
}

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
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="container mx-auto py-6 space-y-6">
      <PermissionsHeader />

      <Card>
        <CardContent className="p-0">
          <PermissionsTable
            permissions={permissions}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <PermissionsPagination />
      </div>

      <PermissionFormDialog />
    </div>
  );
}

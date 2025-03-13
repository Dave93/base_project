"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRoles, RolesResponse } from "@/lib/roles";
import { useRolesStore } from "@/store/roles-store";
import {
  RolesHeader,
  RolesTable,
  RolesPagination,
  RoleFormDialog
} from "@/components/roles";

export default function RolesPage() {
  // Clean up store when component unmounts
  useEffect(() => {
    return () => {
      useRolesStore.getState().reset();
    };
  }, []);

  // Get current page from store for data fetching only
  const currentPage = useRolesStore((state) => state.currentPage);
  
  // Query to fetch roles
  const { data, isLoading } = useQuery<RolesResponse | null>({
    queryKey: ["roles", currentPage],
    queryFn: () => getRoles(currentPage, 10)
  });

  // Update pagination data in store when data changes
  const setPaginationData = useRolesStore((state) => state.setPaginationData);
  useEffect(() => {
    if (data?.pagination) {
      setPaginationData(data.pagination);
    }
  }, [data?.pagination, setPaginationData]);

  const roles = data?.roles || [];

  return (
    <>
      <RolesHeader />

      <RolesTable
        roles={roles}
        isLoading={isLoading}
      />

      <RolesPagination />

      <RoleFormDialog />
    </>
  );
}

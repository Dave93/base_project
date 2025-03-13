"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsers, UsersResponse } from "@/lib/users";
import { useUsersStore } from "@/store/users-store";
import {
  UsersHeader,
  UsersTable,
  UsersPagination,
  UserFormDialog
} from "@/components/users";

export default function UsersPage() {
  // Clean up store when component unmounts
  useEffect(() => {
    return () => {
      useUsersStore.getState().reset();
    };
  }, []);

  // Get current page from store for data fetching only
  const currentPage = useUsersStore((state) => state.currentPage);
  
  // Query to fetch users
  const { data, isLoading } = useQuery<UsersResponse | null>({
    queryKey: ["users", currentPage],
    queryFn: () => getUsers(currentPage, 10)
  });

  // Update pagination data in store when data changes
  const setPaginationData = useUsersStore((state) => state.setPaginationData);
  
  // Используем useEffect напрямую, без дополнительных колбэков
  useEffect(() => {
    if (data?.pagination) {
      setPaginationData(data.pagination);
    }
  }, [data?.pagination, setPaginationData]);

  const users = data?.users || [];

  return (
    <>
      <UsersHeader />

      <UsersTable
        users={users}
        isLoading={isLoading}
      />

      <UsersPagination />

      <UserFormDialog />
    </>
  );
} 
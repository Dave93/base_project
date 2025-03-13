"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useUsersStore } from "@/store/users-store";

export function UsersHeader() {
  const openCreateDialog = useUsersStore((state) => state.openCreateDialog);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and their roles
        </p>
      </div>
      <Button onClick={openCreateDialog}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  );
} 
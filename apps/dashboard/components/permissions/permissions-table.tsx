"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, Trash2 } from "lucide-react";
import { Permission } from "@auth-apps/db";
import { usePermissionsStore } from "@/store/permissions-store";
import { deletePermission } from "@/lib/permissions";
import { toast } from "sonner";
import { DeleteConfirmationPopover } from "./delete-confirmation-popover";

interface PermissionsTableProps {
  permissions: Permission[];
  isLoading: boolean;
}

export function PermissionsTable({
  permissions,
  isLoading,
}: PermissionsTableProps) {
  const t = useTranslations("Permissions");
  const setFormDialogOpen = usePermissionsStore((state) => state.setFormDialogOpen);
  const setCurrentPermission = usePermissionsStore((state) => state.setCurrentPermission);

  const handleEdit = (permission: Permission) => {
    setCurrentPermission(permission);
    setFormDialogOpen(true);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("code")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-10">
                {t("loading")}
              </TableCell>
            </TableRow>
          ) : permissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-10">
                {t("noPermissions")}
              </TableCell>
            </TableRow>
          ) : (
            permissions.map((permission) => {
              return (
                <TableRow key={permission.id}>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell>{permission.code}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(permission)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmationPopover permissionId={permission.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

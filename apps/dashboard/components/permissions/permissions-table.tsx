"use client";

import { useTranslations } from "next-intl";
import { Permission } from "@auth-apps/db";
import { usePermissionsStore } from "@/store/permissions-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ShieldAlert } from "lucide-react";
import { DeleteConfirmationPopover } from "./delete-confirmation-popover";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">{t("name")}</TableHead>
            <TableHead className="w-[40%]">{t("code")}</TableHead>
            <TableHead className="text-right w-[20%]">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : permissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ShieldAlert className="h-8 w-8 mb-2" />
                  <p>{t("noPermissions")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            permissions.map((permission) => {
              return (
                <TableRow key={permission.id} className="group">
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {permission.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1 opacity-70 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(permission)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">{t("edit")}</span>
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

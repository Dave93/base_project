"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getRolePermissions, addPermissionToRole, removePermissionFromRole } from "@/lib/roles";
import { getPermissions } from "@/lib/permissions";
import { Shield } from "lucide-react";

interface RoleAccordionContentProps {
  roleId: string;
  isExpanded: boolean;
}

export function RoleAccordionContent({ roleId, isExpanded }: RoleAccordionContentProps) {
  const t = useTranslations("Roles");
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all permissions
  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => getPermissions(1, 100)
  });

  // Fetch role permissions
  const { data: rolePermissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => getRolePermissions(roleId),
    enabled: isExpanded,
  });

  // Mutation to add permission to role
  const addPermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      addPermissionToRole(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      toast.success(t("permissionAddedSuccess"));
    },
    onError: () => {
      toast.error(t("permissionAddedError"));
    },
  });

  // Mutation to remove permission from role
  const removePermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      removePermissionFromRole(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      toast.success(t("permissionRemovedSuccess"));
    },
    onError: () => {
      toast.error(t("permissionRemovedError"));
    },
  });

  // Handle permission toggle
  const handlePermissionToggle = async (permissionId: string, isAssigned: boolean) => {
    setIsLoading(true);
    try {
      if (isAssigned) {
        await removePermissionMutation.mutateAsync({ roleId, permissionId });
      } else {
        await addPermissionMutation.mutateAsync({ roleId, permissionId });
      }
    } catch (error) {
      console.error("Error toggling permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const permissions = permissionsData?.permissions || [];
  const rolePermissions = rolePermissionsData?.permissions || [];
  
  // Create a map of permission IDs that are assigned to the role
  const assignedPermissions: Record<string, boolean> = {};
  rolePermissions.forEach((rp: { permission: { id: string; name: string; code: string; } | null }) => {
    if (rp.permission) {
      assignedPermissions[rp.permission.id] = true;
    }
  });

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="font-medium">{t("rolePermissions")}</h3>
      </div>
      
      {isLoadingPermissions ? (
        <div className="text-center py-6 text-muted-foreground">{t("loadingPermissions")}</div>
      ) : permissions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">{t("noPermissions")}</div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">{t("permissionName")}</TableHead>
                <TableHead className="font-medium">{t("permissionCode")}</TableHead>
                <TableHead className="text-right font-medium w-[100px]">{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => {
                const isAssigned = !!assignedPermissions[permission.id];
                return (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{permission.code}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={isAssigned}
                        onCheckedChange={() => handlePermissionToggle(permission.id, isAssigned)}
                        disabled={isLoading}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

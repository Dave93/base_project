"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  getRole, 
  getRolePermissions, 
  addPermissionToRole, 
  removePermissionFromRole 
} from "@/lib/roles";
import { getPermissions } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RolePermissionsProps {
  roleId: string;
}

export function RolePermissions({ roleId }: RolePermissionsProps) {
  const t = useTranslations("Roles");
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch role details
  const { data: roleData } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => getRole(roleId)
  });

  // Fetch all permissions
  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => getPermissions(1, 100)
  });

  // Fetch role permissions
  const { data: rolePermissionsData } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => getRolePermissions(roleId)
  });

  // Create a map of permission IDs that are assigned to the role
  const [assignedPermissions, setAssignedPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (rolePermissionsData?.permissions) {
      const permissionMap: Record<string, boolean> = {};
      rolePermissionsData.permissions.forEach((rp: { permission: { id: string } | null }) => {
        if (rp.permission) {
          permissionMap[rp.permission.id] = true;
        }
      });
      setAssignedPermissions(permissionMap);
    }
  }, [rolePermissionsData]);

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

  const handlePermissionToggle = async (permissionId: string, isAssigned: boolean) => {
    setIsLoading(true);
    try {
      if (isAssigned) {
        await removePermissionMutation.mutateAsync({ roleId, permissionId });
        setAssignedPermissions(prev => ({ ...prev, [permissionId]: false }));
      } else {
        await addPermissionMutation.mutateAsync({ roleId, permissionId });
        setAssignedPermissions(prev => ({ ...prev, [permissionId]: true }));
      }
    } catch (error) {
      console.error("Error toggling permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const role = roleData?.role;
  const permissions = permissionsData?.permissions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard/roles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToRoles")}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("manageRolePermissions", { roleName: role?.name || "" })}
          </h1>
          <p className="text-muted-foreground">
            {t("manageRolePermissionsDescription")}
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("permissionName")}</TableHead>
              <TableHead>{t("permissionCode")}</TableHead>
              <TableHead className="text-right">{t("status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  {t("noPermissions")}
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => {
                const isAssigned = !!assignedPermissions[permission.id];
                return (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.name}</TableCell>
                    <TableCell>{permission.code}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={isAssigned}
                        onCheckedChange={() => handlePermissionToggle(permission.id, isAssigned)}
                        disabled={isLoading}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

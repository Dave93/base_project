"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createPermission, updatePermission } from "@/lib/permissions";
import { usePermissionsStore } from "@/store/permissions-store";

export function PermissionFormDialog() {
  const t = useTranslations("Permissions");
  const queryClient = useQueryClient();
  
  // Get state from Zustand store
  const isOpen = usePermissionsStore((state) => state.isFormDialogOpen);
  const setIsOpen = usePermissionsStore((state) => state.setFormDialogOpen);
  const currentPermission = usePermissionsStore((state) => state.currentPermission);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  useEffect(() => {
    if (currentPermission) {
      setFormData({
        name: currentPermission.name,
        code: currentPermission.code,
      });
    } else {
      setFormData({
        name: "",
        code: "",
      });
    }
  }, [currentPermission]);

  // Mutation for creating a permission
  const createMutation = useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      toast.success(t("createSuccess"));
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => {
      toast.error(t("createError"));
    },
  });

  // Mutation for updating a permission
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; code: string } }) => 
      updatePermission(id, data),
    onSuccess: () => {
      toast.success(t("updateSuccess"));
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => {
      toast.error(t("updateError"));
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentPermission) {
      updateMutation.mutate({
        id: currentPermission.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentPermission ? t("editPermission") : t("createPermission")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                {t("name")}
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="code" className="text-right">
                {t("code")}
              </label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {currentPermission ? t("update") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

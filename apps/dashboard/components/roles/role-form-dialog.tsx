"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createRole, updateRole } from "@/lib/roles";
import { useRolesStore } from "@/store/roles-store";

export function RoleFormDialog() {
  const t = useTranslations("Roles");
  const queryClient = useQueryClient();
  
  // Get state from Zustand store
  const isOpen = useRolesStore((state) => state.isFormDialogOpen);
  const setIsOpen = useRolesStore((state) => state.setFormDialogOpen);
  const currentRole = useRolesStore((state) => state.currentRole);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    if (currentRole) {
      setFormData({
        name: currentRole.name,
        code: currentRole.code,
        description: currentRole.description || "",
        active: currentRole.active ?? true,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        active: true,
      });
    }
  }, [currentRole]);

  // Mutation for creating a role
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success(t("createSuccess"));
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => {
      toast.error(t("createError"));
    },
  });

  // Mutation for updating a role
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      updateRole(id, data),
    onSuccess: () => {
      toast.success(t("updateSuccess"));
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => {
      toast.error(t("updateError"));
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentRole) {
      updateMutation.mutate({
        id: currentRole.id,
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
            {currentRole ? t("editRole") : t("createRole")}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                {t("description")}
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="active" className="text-right">
                {t("active")}
              </label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange}
                />
                <span>{formData.active ? t("active") : t("inactive")}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {currentRole ? t("update") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

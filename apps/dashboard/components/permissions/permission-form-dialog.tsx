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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createPermission, updatePermission } from "@/lib/permissions";
import { usePermissionsStore } from "@/store/permissions-store";
import { Loader2, ShieldCheck } from "lucide-react";

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

  const [errors, setErrors] = useState({
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
    setErrors({ name: "", code: "" });
  }, [currentPermission, isOpen]);

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
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { name: "", code: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired");
      isValid = false;
    }

    if (!formData.code.trim()) {
      newErrors.code = t("codeRequired");
      isValid = false;
    } else if (!/^[A-Z_]+$/.test(formData.code)) {
      newErrors.code = t("codeFormat");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (currentPermission) {
      updateMutation.mutate({
        id: currentPermission.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isPending && setIsOpen(open)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle>
              {currentPermission ? t("editPermission") : t("createPermission")}
            </DialogTitle>
          </div>
          <DialogDescription>
            {t("formDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("name")}
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-destructive" : ""}
                placeholder={t("namePlaceholder")}
                disabled={isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code" className="text-sm font-medium">
                {t("code")}
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`font-mono uppercase ${errors.code ? "border-destructive" : ""}`}
                placeholder={t("codePlaceholder")}
                disabled={isPending}
              />
              {errors.code ? (
                <p className="text-sm text-destructive">{errors.code}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t("codeHelp")}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentPermission ? t("update") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

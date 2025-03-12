"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePermissionsStore } from "@/store/permissions-store";

export function PermissionsHeader() {
  const t = useTranslations("Permissions");
  const setFormDialogOpen = usePermissionsStore((state) => state.setFormDialogOpen);
  const setCurrentPermission = usePermissionsStore((state) => state.setCurrentPermission);

  const handleAddNew = () => {
    setCurrentPermission(null);
    setFormDialogOpen(true);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <Button onClick={handleAddNew}>
        <Plus className="mr-2 h-4 w-4" /> {t("addNew")}
      </Button>
    </div>
  );
}

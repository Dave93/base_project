"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck } from "lucide-react";
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
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
      </div>
      <Button onClick={handleAddNew} className="w-full md:w-auto">
        <Plus className="mr-2 h-4 w-4" /> {t("addNew")}
      </Button>
    </div>
  );
}

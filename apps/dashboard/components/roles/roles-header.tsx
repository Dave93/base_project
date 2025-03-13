"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldCheck } from "lucide-react";
import { useRolesStore } from "@/store/roles-store";

export function RolesHeader() {
  const t = useTranslations("Roles");
  const setFormDialogOpen = useRolesStore((state) => state.setFormDialogOpen);
  const setCurrentRole = useRolesStore((state) => state.setCurrentRole);

  const handleAddNew = () => {
    setCurrentRole(null);
    setFormDialogOpen(true);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <Button onClick={handleAddNew} size="sm" className="h-9 px-4">
        <PlusCircle className="mr-2 h-4 w-4" />
        {t("addNew")}
      </Button>
    </div>
  );
}

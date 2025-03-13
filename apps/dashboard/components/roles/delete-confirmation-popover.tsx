"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteRole } from "@/lib/roles";
import { toast } from "sonner";

interface DeleteConfirmationPopoverProps {
  roleId: string;
}

export function DeleteConfirmationPopover({ roleId }: DeleteConfirmationPopoverProps) {
  const t = useTranslations("Roles");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success(t("deleteSuccess"));
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => {
      toast.error(t("deleteError"));
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(roleId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          title={t("delete")}
          className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          <span>{t("delete")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-medium leading-none">{t("deleteConfirmation")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("deleteWarning")}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

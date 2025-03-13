"use client";

import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { deletePermission } from "@/lib/permissions";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteConfirmationPopover({
  permissionId
}: {
  permissionId: string
}) {
  const t = useTranslations("Permissions");
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Mutation for deleting a permission
  const deleteMutation = useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      toast.success(t("deleteSuccess"));
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => {
      toast.error(t("deleteError"));
    },
  });

  const handleDelete = () => {
    if (!permissionId) return;
    deleteMutation.mutate(permissionId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t("delete")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 p-2 rounded-full">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <h4 className="font-medium">{t("deleteConfirmation")}</h4>
          </div>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            {t("deleteWarning")}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 pt-2 border-t mt-2">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            {t("cancel")}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete} 
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("delete")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

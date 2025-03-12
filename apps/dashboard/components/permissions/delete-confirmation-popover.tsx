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
import { Trash2 } from "lucide-react";
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
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">{t("deleteConfirmation")}</h4>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              {t("cancel")}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
            >
              {t("delete")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

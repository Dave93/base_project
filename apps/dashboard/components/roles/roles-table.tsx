"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ChevronDown, Info } from "lucide-react";
import { Role } from "@auth-apps/db";
import { useRolesStore } from "@/store/roles-store";
import { DeleteConfirmationPopover } from "./delete-confirmation-popover";
import { RoleAccordionContent } from "./role-accordion-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RolesTableProps {
  roles: Role[];
  isLoading: boolean;
}

export function RolesTable({ roles, isLoading }: RolesTableProps) {
  const t = useTranslations("Roles");
  const setFormDialogOpen = useRolesStore((state) => state.setFormDialogOpen);
  const setCurrentRole = useRolesStore((state) => state.setCurrentRole);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    setFormDialogOpen(true);
  };

  // Handle accordion toggle
  const handleAccordionToggle = (roleId: string) => {
    setExpandedRoles(prev => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center shadow-sm bg-background">
        {t("loading")}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center shadow-sm bg-background">
        {t("noRoles")}
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {roles.map((role) => (
        <AccordionItem 
          key={role.id} 
          value={role.id} 
          className={`border rounded-md shadow-sm transition-all hover:shadow ${role.active ? 'bg-background' : 'bg-muted/30'}`}
        >
          <div className="flex items-center justify-between px-6">
            <AccordionTrigger 
              onClick={() => handleAccordionToggle(role.id)}
              className="py-5 flex-1"
            >
              <div className="flex items-center justify-between w-full pr-4 gap-4">
                <div className="flex flex-col items-start gap-1">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {role.name}
                    {role.active ? (
                      <Badge variant="success" className="ml-2 text-xs">
                        {t("active")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {t("inactive")}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">{role.code}</div>
                </div>
                
                {role.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-sm text-muted-foreground max-w-[200px] truncate">
                          <Info className="h-4 w-4 mr-1 inline-block flex-shrink-0" />
                          <span className="truncate">{role.description}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{role.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </AccordionTrigger>
            <div className="flex space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(role);
                }}
                title={t("edit")}
                className="h-8"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                <span>{t("edit")}</span>
              </Button>
              <DeleteConfirmationPopover roleId={role.id} />
            </div>
          </div>
          <AccordionContent className="border-t bg-card px-6">
            {expandedRoles[role.id] && (
              <RoleAccordionContent 
                roleId={role.id} 
                isExpanded={expandedRoles[role.id]} 
              />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

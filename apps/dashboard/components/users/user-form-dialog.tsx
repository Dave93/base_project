"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsersStore } from "@/store/users-store";
import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, getUser, updateUser } from "@/lib/users";
import { getRoles } from "@/lib/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserFormDialog() {
  // Получаем состояние из хранилища по отдельности, чтобы избежать бесконечного цикла
  const isDialogOpen = useUsersStore((state) => state.isDialogOpen);
  const isEditMode = useUsersStore((state) => state.isEditMode);
  const currentUserId = useUsersStore((state) => state.currentUserId);
  const closeDialog = useUsersStore((state) => state.closeDialog);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role_id: "",
  });

  const queryClient = useQueryClient();

  // Fetch roles for the dropdown
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(1, 100),
    enabled: isDialogOpen,
  });

  // Fetch user data when editing
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", currentUserId],
    queryFn: () => getUser(currentUserId!),
    enabled: isDialogOpen && isEditMode && !!currentUserId,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (isEditMode && userData?.user) {
        setFormData({
          email: userData.user.email,
          name: userData.user.name || "",
          password: "", // Don't populate password field when editing
          role_id: userData.user.role_id || "",
        });
      } else {
        setFormData({
          email: "",
          name: "",
          password: "",
          role_id: "",
        });
      }
    }
  }, [isDialogOpen, isEditMode, userData]);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeDialog();
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeDialog();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && currentUserId) {
      // When updating, only include password if it was changed
      const updateData = {
        email: formData.email,
        name: formData.name || null,
        role_id: formData.role_id || null,
      };
      
      if (formData.password) {
        (updateData as any).password = formData.password;
      }
      
      updateMutation.mutate({
        id: currentUserId,
        data: updateData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      role_id: value === "none" ? "" : value 
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit User" : "Create User"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update user details below."
                : "Fill in the information to create a new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="col-span-3"
                required={!isEditMode}
                placeholder={isEditMode ? "Leave blank to keep current" : ""}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={formData.role_id || "none"}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Role</SelectItem>
                  {rolesData?.roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
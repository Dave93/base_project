import { create } from "zustand";
import { PaginationData, User } from "@/lib/users";

interface UsersState {
  // Dialog state
  isDialogOpen: boolean;
  isEditMode: boolean;
  currentUserId: string | null;
  
  // Pagination state
  currentPage: number;
  pagination: PaginationData | null;
  
  // Actions
  openCreateDialog: () => void;
  openEditDialog: (userId: string) => void;
  closeDialog: () => void;
  setCurrentPage: (page: number) => void;
  setPaginationData: (pagination: PaginationData) => void;
  reset: () => void;
}

const initialState = {
  isDialogOpen: false,
  isEditMode: false,
  currentUserId: null,
  currentPage: 1,
  pagination: null,
};

export const useUsersStore = create<UsersState>((set) => ({
  ...initialState,
  
  openCreateDialog: () => set({
    isDialogOpen: true,
    isEditMode: false,
    currentUserId: null,
  }),
  
  openEditDialog: (userId: string) => set({
    isDialogOpen: true,
    isEditMode: true,
    currentUserId: userId,
  }),
  
  closeDialog: () => set({
    isDialogOpen: false,
    isEditMode: false,
    currentUserId: null,
  }),
  
  setCurrentPage: (page: number) => set({ currentPage: page }),
  
  setPaginationData: (pagination: PaginationData) => set({ pagination }),
  
  reset: () => set(initialState),
})); 
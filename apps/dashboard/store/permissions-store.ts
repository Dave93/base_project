import { create } from 'zustand';
import { Permission } from '@auth-apps/db';
import { PaginationData } from '@/lib/permissions';

interface PermissionsState {
  // Pagination state
  currentPage: number;
  setCurrentPage: (page: number) => void;
  
  // Form dialog state
  isFormDialogOpen: boolean;
  setFormDialogOpen: (isOpen: boolean) => void;
  
  // Delete dialog state
  isDeleteDialogOpen: boolean;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  
  // Selected permission
  currentPermission: Permission | null;
  setCurrentPermission: (permission: Permission | null) => void;
  
  // Pagination data (from API)
  paginationData: PaginationData;
  setPaginationData: (data: PaginationData) => void;
  
  // Reset store
  reset: () => void;
}

const defaultPaginationData: PaginationData = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export const usePermissionsStore = create<PermissionsState>((set) => ({
  // Initial state
  currentPage: 1,
  isFormDialogOpen: false,
  isDeleteDialogOpen: false,
  currentPermission: null,
  paginationData: defaultPaginationData,
  
  // Actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setFormDialogOpen: (isOpen) => set({ isFormDialogOpen: isOpen }),
  setDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),
  setCurrentPermission: (permission) => set({ currentPermission: permission }),
  setPaginationData: (data) => set({ paginationData: data }),
  
  // Reset the store to initial state
  reset: () => set({
    currentPage: 1,
    isFormDialogOpen: false,
    isDeleteDialogOpen: false,
    currentPermission: null,
    paginationData: defaultPaginationData,
  }),
}));

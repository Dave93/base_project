import { create } from 'zustand';
import { Role } from '@auth-apps/db';

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RolesState {
  // Pagination state
  currentPage: number;
  setCurrentPage: (page: number) => void;
  
  // Form dialog state
  isFormDialogOpen: boolean;
  setFormDialogOpen: (isOpen: boolean) => void;
  
  // Delete dialog state
  isDeleteDialogOpen: boolean;
  setDeleteDialogOpen: (isOpen: boolean) => void;
  
  // Selected role
  currentRole: Role | null;
  setCurrentRole: (role: Role | null) => void;
  
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

export const useRolesStore = create<RolesState>((set) => ({
  // Initial state
  currentPage: 1,
  isFormDialogOpen: false,
  isDeleteDialogOpen: false,
  currentRole: null,
  paginationData: defaultPaginationData,
  
  // Actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setFormDialogOpen: (isOpen) => set({ isFormDialogOpen: isOpen }),
  setDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setPaginationData: (data) => set({ paginationData: data }),
  
  // Reset the store to initial state
  reset: () => set({
    currentPage: 1,
    isFormDialogOpen: false,
    isDeleteDialogOpen: false,
    currentRole: null,
    paginationData: defaultPaginationData,
  }),
}));

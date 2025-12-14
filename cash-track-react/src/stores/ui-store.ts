import { create } from "zustand";

interface UIState {
  // UI State
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  periodFilter: { from: string; to: string };

  // UI actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setPeriodFilter: (from: string, to: string) => void;
}

// Helper function to get current month period
const getCurrentMonthPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    from: firstDay.toISOString().split("T")[0],
    to: lastDay.toISOString().split("T")[0],
  };
};

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  periodFilter: getCurrentMonthPeriod(),

  // UI actions
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open });
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },

  setPeriodFilter: (from, to) => {
    set({ periodFilter: { from, to } });
  },
}));


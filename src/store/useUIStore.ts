import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  modoOscuro: boolean;
  toggleModoOscuro: () => void;
  setModoOscuro: (valor: boolean) => void;
  sidebarAbierto: boolean;
  toggleSidebar: () => void;
  setSidebarAbierto: (valor: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      modoOscuro: false,
      toggleModoOscuro: () => set((state) => ({ modoOscuro: !state.modoOscuro })),
      setModoOscuro: (valor) => set({ modoOscuro: valor }),
      sidebarAbierto: false,
      toggleSidebar: () => set((state) => ({ sidebarAbierto: !state.sidebarAbierto })),
      setSidebarAbierto: (valor) => set({ sidebarAbierto: valor }),
    }),
    {
      name: 'propify-ui-storage',
    }
  )
);

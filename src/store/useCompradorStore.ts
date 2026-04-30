import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Comprador, EstadoComprador, Actividad, FiltrosGlobales } from '../types';

interface CompradorStore {
  compradores: Comprador[];
  modalCrearAbierto: boolean;
  compradorDetalleId: string | null;
  isReadOnly: boolean;
  filtros: FiltrosGlobales;

  // Actions
  setFiltros: (filtros: Partial<FiltrosGlobales>) => void;
  abrirModalCrear: () => void;
  cerrarModalCrear: () => void;
  abrirDetalle: (compradorId: string, readOnly?: boolean) => void;
  cerrarDetalle: () => void;
  agregarComprador: (comprador: Omit<Comprador, 'id' | 'fechaCreacion' | 'actividades' | 'propiedadesInteres'>) => void;
  moverComprador: (compradorId: string, nuevoEstado: EstadoComprador) => void;
  eliminarComprador: (compradorId: string) => void;
  agregarActividad: (compradorId: string, actividad: Omit<Actividad, 'id'>) => void;
  eliminarActividad: (compradorId: string, actividadId: string) => void;
  actualizarComprador: (compradorId: string, data: Partial<Comprador>) => void;
  vincularPropiedad: (compradorId: string, propertyId: string) => void;
  desvincularPropiedad: (compradorId: string, propertyId: string) => void;
  inicializar: () => void;
}

export const useCompradorStore = create<CompradorStore>()(
  persist(
    (set) => ({
      compradores: [],
      modalCrearAbierto: false,
      compradorDetalleId: null,
      isReadOnly: false,
      filtros: {
        fechaInicio: '',
        fechaFin: '',
        score: 'Todos',
        responsableId: 'Todos',
      },

      setFiltros: (nuevosFiltros) =>
        set((state) => ({ filtros: { ...state.filtros, ...nuevosFiltros } })),

      abrirModalCrear: () => set({ modalCrearAbierto: true }),

      cerrarModalCrear: () => set({ modalCrearAbierto: false }),

      abrirDetalle: (compradorId, readOnly = false) => set({ compradorDetalleId: compradorId, isReadOnly: readOnly }),

      cerrarDetalle: () => set({ compradorDetalleId: null, isReadOnly: false }),

      agregarComprador: (compradorData) =>
        set((state) => {
          const year = new Date().getFullYear();
          const count = state.compradores.filter((c) => c.id.endsWith(year.toString())).length + 1;
          const newId = `C-${count.toString().padStart(3, '0')}-${year}`;
          return {
            compradores: [
              ...state.compradores,
              {
                ...compradorData,
                id: newId,
                fechaCreacion: new Date().toISOString(),
                actividades: [],
                propiedadesInteres: [],
              },
            ],
          };
        }),

      moverComprador: (compradorId, nuevoEstado) =>
        set((state) => ({
          compradores: state.compradores.map((c) =>
            c.id === compradorId ? { ...c, estado: nuevoEstado } : c
          ),
        })),

      eliminarComprador: (compradorId) =>
        set((state) => ({
          compradores: state.compradores.filter((c) => c.id !== compradorId),
        })),

      agregarActividad: (compradorId, actividadData) =>
        set((state) => ({
          compradores: state.compradores.map((c) =>
            c.id === compradorId
              ? {
                  ...c,
                  actividades: [
                    { ...actividadData, id: uuidv4() },
                    ...c.actividades,
                  ],
                }
              : c
          ),
        })),

      eliminarActividad: (compradorId, actividadId) =>
        set((state) => ({
          compradores: state.compradores.map((c) =>
            c.id === compradorId
              ? {
                  ...c,
                  actividades: c.actividades.filter((a) => a.id !== actividadId),
                }
              : c
          ),
        })),

      actualizarComprador: (compradorId, data) =>
        set((state) => ({
          compradores: state.compradores.map((c) =>
            c.id === compradorId ? { ...c, ...data } : c
          ),
        })),

      vincularPropiedad: (compradorId, propertyId) =>
        set((state) => ({
          compradores: state.compradores.map((c) =>
            c.id === compradorId 
              ? { ...c, propiedadesInteres: Array.from(new Set([...c.propiedadesInteres, propertyId])) } 
              : c
          ),
        })),

      desvincularPropiedad: (compradorId, propertyId) =>
        set((state) => ({
          compradores: state.compradores.map((c) =>
            c.id === compradorId 
              ? { ...c, propiedadesInteres: c.propiedadesInteres.filter(id => id !== propertyId) } 
              : c
          ),
        })),

      inicializar: () => {
        // Here we can load initial dummy data if needed, or just let it be empty
      },
    }),
    {
      name: 'propify-compradores-storage',
      version: 1,
      // Evitamos guardar los strings base64 pesados en localStorage para no exceder la cuota (5MB)
      partialize: (state) => ({
        ...state,
        compradores: state.compradores.map((c) => ({
          ...c,
          contratoUrl: '', // No persistimos el archivo pesado
          contratoFirmadoUrl: '', // No persistimos el archivo pesado
        })),
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Folio, EstadoFolio, VistaActiva, Actividad, Costo, Notificacion, FiltrosGlobales } from '../types';
import { TIEMPOS_MAXIMOS_ETAPA, ETAPA_LABELS } from '../constants';

interface FolioStore {
  folios: Folio[];
  vistaActiva: VistaActiva;
  modalAbierto: boolean;
  folioDetalleId: string | null;
  notificaciones: Notificacion[];
  initialized: boolean;
  filtros: FiltrosGlobales;

  // Actions
  setVistaActiva: (vista: VistaActiva) => void;
  setFiltros: (filtros: Partial<FiltrosGlobales>) => void;
  abrirModal: () => void;
  cerrarModal: () => void;
  abrirDetalle: (folioId: string) => void;
  cerrarDetalle: () => void;
  agregarFolio: (folio: Omit<Folio, 'id' | 'fechaCreacion' | 'actividades' | 'costos' | 'campanaPausada'>) => void;
  moverFolio: (folioId: string, nuevoEstado: EstadoFolio) => void;
  eliminarFolio: (folioId: string) => void;
  agregarActividad: (folioId: string, actividad: Omit<Actividad, 'id'>) => void;
  eliminarActividad: (folioId: string, actividadId: string) => void;
  agregarCosto: (folioId: string, costo: Omit<Costo, 'id'>) => void;
  eliminarCosto: (folioId: string, costoId: string) => void;
  marcarNotificacionLeida: (notifId: string) => void;
  marcarTodasLeidas: () => void;
  generarNotificaciones: () => void;
  actualizarFolio: (folioId: string, data: Partial<Folio>) => void;
  inicializar: () => void;
}

const foliosEjemplo: Folio[] = [
  {
    id: '001-2026',
    estado: 'Captación',
    tipoInmueble: 'Casa',
    metraje: 120,
    antiguedad: 5,
    partidaRegistral: '12345678',
    precioEsperado: 4500000,
    precioSugerido: 4400000,
    urgenciaVenta: 'Alta',
    latitud: -12.04318,
    longitud: -77.02824,
    origen: 'Orgánico',
    propietarioNombre: 'María García López',
    propietarioDni: '12345678',
    cantidadPropietarios: 1,
    propietarioTelefono: '999888777',
    propietarioEmail: 'maria@example.com',
    nivelDisposicion: 'Media',
    responsable: 'Carlos Mendoza',
    score: 'A',
    direccion: 'Av. Reforma 245, CDMX',
    fechaCreacion: new Date(2026, 3, 10).toISOString(),
    actividades: [],
    costos: [],
  }
];

export const useFolioStore = create<FolioStore>()(
  persist(
    (set, get) => ({
      folios: [],
      vistaActiva: 'kanban',
      modalAbierto: false,
      folioDetalleId: null,
      notificaciones: [],
      initialized: false,
      filtros: {
        fechaInicio: '',
        fechaFin: '',
        score: 'Todos',
        responsableId: 'Todos',
      },

      setVistaActiva: (vista) => set({ vistaActiva: vista }),

      setFiltros: (nuevosFiltros) =>
        set((state) => ({ filtros: { ...state.filtros, ...nuevosFiltros } })),

      abrirModal: () => set({ modalAbierto: true }),

      cerrarModal: () => set({ modalAbierto: false }),

      abrirDetalle: (folioId) => set({ folioDetalleId: folioId }),

      cerrarDetalle: () => set({ folioDetalleId: null }),

      agregarFolio: (folioData) =>
        set((state) => {
          const year = new Date().getFullYear();
          const count = state.folios.filter((f) => f.id.endsWith(year.toString())).length + 1;
          const newId = `${count.toString().padStart(3, '0')}-${year}`;
          return {
            folios: [
              ...state.folios,
              {
                ...folioData,
                id: newId,
                fechaCreacion: new Date().toISOString(),
                actividades: [],
                costos: [],
                campanaPausada: false,
              },
            ],
          };
        }),

      moverFolio: (folioId, nuevoEstado) =>
        set((state) => {
          const folio = state.folios.find((f) => f.id === folioId);
          const newNotificaciones = [...state.notificaciones];

          // If moving to 'Publicado', mark campaign as paused and generate notification
          if (nuevoEstado === 'Publicado' && folio && folio.estado !== 'Publicado') {
            newNotificaciones.unshift({
              id: uuidv4(),
              tipo: 'campana_pausada',
              mensaje: `Campaña detenida para ${folio.tipoInmueble} de ${folio.propietarioNombre}`,
              folioId,
              fecha: new Date().toISOString(),
              leida: false,
            });
          }

          return {
            folios: state.folios.map((f) =>
              f.id === folioId
                ? {
                    ...f,
                    estado: nuevoEstado,
                    campanaPausada: nuevoEstado === 'Publicado' ? true : f.campanaPausada,
                  }
                : f
            ),
            notificaciones: newNotificaciones,
          };
        }),

      eliminarFolio: (folioId) =>
        set((state) => ({
          folios: state.folios.filter((folio) => folio.id !== folioId),
        })),

      agregarActividad: (folioId, actividadData) =>
        set((state) => ({
          folios: state.folios.map((folio) =>
            folio.id === folioId
              ? {
                  ...folio,
                  actividades: [
                    { ...actividadData, id: uuidv4() },
                    ...folio.actividades,
                  ],
                }
              : folio
          ),
        })),

      eliminarActividad: (folioId, actividadId) =>
        set((state) => ({
          folios: state.folios.map((folio) =>
            folio.id === folioId
              ? {
                  ...folio,
                  actividades: folio.actividades.filter((a) => a.id !== actividadId),
                }
              : folio
          ),
        })),

      agregarCosto: (folioId, costoData) =>
        set((state) => ({
          folios: state.folios.map((folio) =>
            folio.id === folioId
              ? {
                  ...folio,
                  costos: [{ ...costoData, id: uuidv4() }, ...folio.costos],
                }
              : folio
          ),
        })),

      eliminarCosto: (folioId, costoId) =>
        set((state) => ({
          folios: state.folios.map((folio) =>
            folio.id === folioId
              ? {
                  ...folio,
                  costos: folio.costos.filter((c) => c.id !== costoId),
                }
              : folio
          ),
        })),

      marcarNotificacionLeida: (notifId) =>
        set((state) => ({
          notificaciones: state.notificaciones.map((n) =>
            n.id === notifId ? { ...n, leida: true } : n
          ),
        })),

      marcarTodasLeidas: () =>
        set((state) => ({
          notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
        })),

      generarNotificaciones: () => {
        const { folios, notificaciones } = get();
        const ahora = new Date();
        const nuevas: Notificacion[] = [];

        // Check for folios that exceeded stage time limits
        folios.forEach((folio) => {
          if (folio.estado === 'Publicado') return;

          const tiempoMaxHoras = TIEMPOS_MAXIMOS_ETAPA[folio.estado];
          if (!tiempoMaxHoras) return;

          const horasEnEtapa =
            (ahora.getTime() - new Date(folio.fechaCreacion).getTime()) / (1000 * 60 * 60);

          if (horasEnEtapa > tiempoMaxHoras) {
            // Check if we already have this notification
            const yaExiste = notificaciones.some(
              (n) =>
                n.folioId === folio.id &&
                n.tipo === 'alerta' &&
                n.mensaje.includes('excedido')
            );

            if (!yaExiste) {
              nuevas.push({
                id: uuidv4(),
                tipo: 'alerta',
                mensaje: `Folio "${folio.tipoInmueble} — ${folio.propietarioNombre}" ha excedido el tiempo en etapa ${ETAPA_LABELS[folio.estado]} (>${Math.round(tiempoMaxHoras / 24)}d)`,
                folioId: folio.id,
                fecha: ahora.toISOString(),
                leida: false,
              });
            }
          }

          // Check for leads without contact
          if (folio.estado === 'Captación' && folio.actividades.length === 0) {
            const horasSinContacto =
              (ahora.getTime() - new Date(folio.fechaCreacion).getTime()) / (1000 * 60 * 60);

            if (horasSinContacto > 24) {
              const yaExiste = notificaciones.some(
                (n) =>
                  n.folioId === folio.id &&
                  n.tipo === 'alerta' &&
                  n.mensaje.includes('sin contactar')
              );

              if (!yaExiste) {
                nuevas.push({
                  id: uuidv4(),
                  tipo: 'alerta',
                  mensaje: `Lead sin contactar: ${folio.propietarioNombre} (${Math.round(horasSinContacto)}h sin actividad)`,
                  folioId: folio.id,
                  fecha: ahora.toISOString(),
                  leida: false,
                });
              }
            }
          }
        });

        if (nuevas.length > 0) {
          set((state) => ({
            notificaciones: [...nuevas, ...state.notificaciones],
          }));
        }
      },

      actualizarFolio: (folioId, data) =>
        set((state) => ({
          folios: state.folios.map((f) =>
            f.id === folioId ? { ...f, ...data } : f
          ),
        })),

      inicializar: () => {
        const { folios, initialized } = get();
        if (!initialized || folios.length === 0) {
          set({ folios: foliosEjemplo, initialized: true });
        }
      },
    }),
    {
      name: 'propify-folios-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 1 || !version) {
          // Migration from old schema
          if (persistedState && persistedState.folios) {
            persistedState.folios = persistedState.folios.map((f: any) => {
              const { categoria, sede, propietarioContacto, nivelDisposicion, ...rest } = f;
              return {
                ...rest,
                antiguedad: parseInt(String(f.antiguedad)) || 0,
                propietarioTelefono: propietarioContacto || '',
                propietarioEmail: '',
                nivelDisposicion: f.nivelDisposicion || 'Media',
              };
            });
          }
        }
        return persistedState;
      },
    }
  )
);

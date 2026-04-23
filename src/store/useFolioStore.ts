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
  inicializar: () => void;
}

const foliosEjemplo: Folio[] = [
  {
    id: 'folio-001',
    estado: 'captacion',
    tipoInmueble: 'Casa',
    propietario: 'María García López',
    responsable: 'Carlos Mendoza',
    score: 'A',
    direccion: 'Av. Reforma 245, Col. Juárez, CDMX',
    precio: 4500000,
    fechaCreacion: new Date(2026, 3, 10).toISOString(),
    actividades: [
      {
        id: uuidv4(),
        tipo: 'Llamada',
        fecha: new Date(2026, 3, 10).toISOString(),
        responsable: 'Carlos Mendoza',
        resultado: 'Se contactó al propietario, interesado en vender. Se agendó visita.',
      },
      {
        id: uuidv4(),
        tipo: 'Visita',
        fecha: new Date(2026, 3, 14).toISOString(),
        responsable: 'Carlos Mendoza',
        resultado: 'Propiedad en excelente estado. Se tomaron fotografías. Pendiente valuación.',
      },
    ],
    costos: [
      {
        id: uuidv4(),
        categoria: 'Gasolina',
        descripcion: 'Visita inicial a la propiedad',
        monto: 350,
        fecha: new Date(2026, 3, 14).toISOString(),
      },
      {
        id: uuidv4(),
        categoria: 'Fotografía',
        descripcion: 'Sesión fotográfica profesional',
        monto: 2500,
        fecha: new Date(2026, 3, 15).toISOString(),
      },
    ],
  },
  {
    id: 'folio-002',
    estado: 'legal',
    tipoInmueble: 'Departamento',
    propietario: 'Roberto Sánchez Pérez',
    responsable: 'Ana Torres',
    score: 'B',
    direccion: 'Calle Durango 120, Col. Roma Norte, CDMX',
    precio: 3200000,
    fechaCreacion: new Date(2026, 3, 5).toISOString(),
    actividades: [
      {
        id: uuidv4(),
        tipo: 'Validación',
        fecha: new Date(2026, 3, 7).toISOString(),
        responsable: 'Ana Torres',
        resultado: 'Documentos verificados. Escrituras al corriente.',
      },
    ],
    costos: [
      {
        id: uuidv4(),
        categoria: 'Trámites',
        descripcion: 'Certificado de libertad de gravamen',
        monto: 1200,
        fecha: new Date(2026, 3, 8).toISOString(),
      },
    ],
  },
  {
    id: 'folio-003',
    estado: 'marketing',
    tipoInmueble: 'Oficina',
    propietario: 'Grupo Inmobiliario del Valle SA',
    responsable: 'Carlos Mendoza',
    score: 'C',
    direccion: 'Paseo de la Reforma 510, Piso 12, CDMX',
    precio: 8750000,
    fechaCreacion: new Date(2026, 2, 28).toISOString(),
    actividades: [
      {
        id: uuidv4(),
        tipo: 'Reunión',
        fecha: new Date(2026, 2, 1).toISOString(),
        responsable: 'Carlos Mendoza',
        resultado: 'Reunión inicial con el corporativo. Necesitan vender antes de junio.',
      },
    ],
    costos: [
      {
        id: uuidv4(),
        categoria: 'Pauta Publicitaria',
        descripcion: 'Campaña en portales inmobiliarios',
        monto: 5000,
        fecha: new Date(2026, 3, 1).toISOString(),
      },
      {
        id: uuidv4(),
        categoria: 'Fotografía',
        descripcion: 'Tour virtual 360°',
        monto: 4500,
        fecha: new Date(2026, 3, 2).toISOString(),
      },
    ],
  },
  // Extra folios for richer agent data
  {
    id: 'folio-004',
    estado: 'cerrado',
    tipoInmueble: 'Casa',
    propietario: 'Luisa Fernández Ríos',
    responsable: 'Ana Torres',
    score: 'A',
    direccion: 'Insurgentes Sur 1802, Col. Florida, CDMX',
    precio: 6200000,
    fechaCreacion: new Date(2026, 1, 15).toISOString(),
    campanaPausada: true,
    actividades: [
      {
        id: uuidv4(),
        tipo: 'Firma',
        fecha: new Date(2026, 3, 1).toISOString(),
        responsable: 'Ana Torres',
        resultado: 'Firma de escritura completada. Operación cerrada exitosamente.',
      },
      {
        id: uuidv4(),
        tipo: 'Visita',
        fecha: new Date(2026, 2, 20).toISOString(),
        responsable: 'Ana Torres',
        resultado: 'Cliente visitó la propiedad, interesado. Oferta aceptada.',
      },
    ],
    costos: [
      {
        id: uuidv4(),
        categoria: 'Notaría',
        descripcion: 'Escrituración',
        monto: 15000,
        fecha: new Date(2026, 3, 1).toISOString(),
      },
      {
        id: uuidv4(),
        categoria: 'Comisión',
        descripcion: 'Comisión agente',
        monto: 93000,
        fecha: new Date(2026, 3, 1).toISOString(),
      },
    ],
  },
  {
    id: 'folio-005',
    estado: 'venta',
    tipoInmueble: 'Terreno',
    propietario: 'Jorge Ramírez Castillo',
    responsable: 'Pedro Villanueva',
    score: 'B',
    direccion: 'Km 15 Carretera a Cuernavaca, Morelos',
    precio: 2800000,
    fechaCreacion: new Date(2026, 3, 1).toISOString(),
    actividades: [
      {
        id: uuidv4(),
        tipo: 'Seguimiento',
        fecha: new Date(2026, 3, 18).toISOString(),
        responsable: 'Pedro Villanueva',
        resultado: 'Comprador potencial confirmó interés. Negociando precio final.',
      },
    ],
    costos: [
      {
        id: uuidv4(),
        categoria: 'Gasolina',
        descripcion: 'Visitas al terreno (3)',
        monto: 900,
        fecha: new Date(2026, 3, 10).toISOString(),
      },
    ],
  },
  {
    id: 'folio-006',
    estado: 'cerrado',
    tipoInmueble: 'Departamento',
    propietario: 'Sofía Martínez Leal',
    responsable: 'Carlos Mendoza',
    score: 'A',
    direccion: 'Polanco IV Sección, Miguel Hidalgo, CDMX',
    precio: 5800000,
    fechaCreacion: new Date(2026, 1, 20).toISOString(),
    campanaPausada: true,
    actividades: [
      {
        id: uuidv4(),
        tipo: 'Firma',
        fecha: new Date(2026, 3, 5).toISOString(),
        responsable: 'Carlos Mendoza',
        resultado: 'Cierre exitoso. Cliente satisfecho.',
      },
    ],
    costos: [
      {
        id: uuidv4(),
        categoria: 'Pauta Publicitaria',
        descripcion: 'Redes sociales + portales',
        monto: 8000,
        fecha: new Date(2026, 2, 10).toISOString(),
      },
      {
        id: uuidv4(),
        categoria: 'Comisión',
        descripcion: 'Comisión agente',
        monto: 87000,
        fecha: new Date(2026, 3, 5).toISOString(),
      },
    ],
  },
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
        set((state) => ({
          folios: [
            ...state.folios,
            {
              ...folioData,
              id: uuidv4(),
              fechaCreacion: new Date().toISOString(),
              actividades: [],
              costos: [],
              campanaPausada: false,
            },
          ],
        })),

      moverFolio: (folioId, nuevoEstado) =>
        set((state) => {
          const folio = state.folios.find((f) => f.id === folioId);
          const newNotificaciones = [...state.notificaciones];

          // If moving to 'cerrado', mark campaign as paused and generate notification
          if (nuevoEstado === 'cerrado' && folio && folio.estado !== 'cerrado') {
            newNotificaciones.unshift({
              id: uuidv4(),
              tipo: 'campana_pausada',
              mensaje: `Campaña detenida para ${folio.tipoInmueble} de ${folio.propietario}`,
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
                    campanaPausada: nuevoEstado === 'cerrado' ? true : f.campanaPausada,
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
          if (folio.estado === 'cerrado') return;

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
                mensaje: `Folio "${folio.tipoInmueble} — ${folio.propietario}" ha excedido el tiempo en etapa ${ETAPA_LABELS[folio.estado]} (>${Math.round(tiempoMaxHoras / 24)}d)`,
                folioId: folio.id,
                fecha: ahora.toISOString(),
                leida: false,
              });
            }
          }

          // Check for leads without contact
          if (folio.estado === 'captacion' && folio.actividades.length === 0) {
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
                  mensaje: `Lead sin contactar: ${folio.propietario} (${Math.round(horasSinContacto)}h sin actividad)`,
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

      inicializar: () => {
        const { folios, initialized } = get();
        if (!initialized || folios.length === 0) {
          set({ folios: foliosEjemplo, initialized: true });
        }
      },
    }),
    {
      name: 'propify-folios-storage',
    }
  )
);

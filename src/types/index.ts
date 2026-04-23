export type EstadoFolio = 'captacion' | 'legal' | 'marketing' | 'venta' | 'cerrado';

export type ScoreFolio = 'A' | 'B' | 'C';

export type TipoInmueble =
  | 'Casa'
  | 'Departamento'
  | 'Terreno'
  | 'Oficina'
  | 'Local Comercial'
  | 'Bodega';

export type TipoActividad =
  | 'Llamada'
  | 'Visita'
  | 'Validación'
  | 'Reunión'
  | 'Firma'
  | 'Seguimiento'
  | 'Otro';

export type CategoriaCosto =
  | 'Gasolina'
  | 'Trámites'
  | 'Pauta Publicitaria'
  | 'Fotografía'
  | 'Notaría'
  | 'Comisión'
  | 'Otro';

export type TipoNotificacion = 'alerta' | 'info' | 'campana_pausada';

export type RolUsuario = 'Admin' | 'Comercial' | 'Call Center' | 'Legal';

export interface Usuario {
  id: string;
  nombre: string;
  rol: RolUsuario;
  avatar: string; // emoji or initials color
  color: string;  // gradient color identifier
  activo: boolean;
}

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  fecha: string;
  responsable: string;
  resultado: string;
}

export interface Costo {
  id: string;
  categoria: CategoriaCosto;
  descripcion: string;
  monto: number;
  fecha: string;
}

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  folioId: string;
  fecha: string;
  leida: boolean;
}

export interface Folio {
  id: string;
  estado: EstadoFolio;
  tipoInmueble: TipoInmueble;
  propietario: string;
  responsable: string;
  score: ScoreFolio;
  direccion?: string;
  precio?: number;
  fechaCreacion: string;
  actividades: Actividad[];
  costos: Costo[];
  campanaPausada?: boolean;
}

export interface ColumnaKanban {
  id: EstadoFolio;
  titulo: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

export type VistaActiva = 'kanban' | 'dashboard' | 'agentes' | 'usuarios';

export interface FiltrosGlobales {
  fechaInicio: string;
  fechaFin: string;
  score: ScoreFolio | 'Todos';
  responsableId: string | 'Todos';
}

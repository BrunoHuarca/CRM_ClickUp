export type EstadoFolio = 'Captación' | 'Comercial' | 'Legal' | 'Firma' | 'Gerencia' | 'Marketing' | 'Publicado' | 'Cancelado';

export type ScoreFolio = 'A' | 'B' | 'C';

export type TipoInmueble =
  | 'Casa'
  | 'Departamento'
  | 'Terreno';

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

export type RolUsuario = string;

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
  horaInicio?: string;
  horaFin?: string;
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
  // DATOS GENERALES
  id: string;
  estado: EstadoFolio;
  fechaCierre?: string;
  tiempoTotalProceso?: number;
  responsablePrincipal?: string;
  readonly fechaCreacion: string;

  // DATOS DEL INMUEBLE
  tipoInmueble: TipoInmueble;
  metraje: number;
  antiguedad: number;
  partidaRegistral: string;
  precioEsperado: number;
  precioSugerido: number;
  urgenciaVenta: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  latitud: number;
  longitud: number;

  // DATOS DEL PROPIETARIO
  origen: 'Meta' | 'Orgánico' | 'Referido';
  propietarioNombre: string;
  propietarioDni: string;
  cantidadPropietarios: number;
  propietarioTelefono: string;
  propietarioEmail: string;
  nivelDisposicion: 'Alta' | 'Media' | 'Baja';
  score: ScoreFolio;
  visitaProgramada?: string;
  tasacion?: number;
  negociacionAceptada?: boolean;
  multimediaUrls?: string[];
  estudioTitulos?: 'Apto' | 'Regularizar';
  contratoExclusividadUrl?: string;
  requiereSaneamiento?: boolean;
  contratoFirmadoUrl?: string;
  
  // DATOS DE GERENCIA
  segmentacionAdecuada?: string;
  inversionPautaAdecuada?: number;
  duracionPublicacion?: string;
  
  // DATOS DE MARKETING
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  webUrl?: string;
  otrosUrl?: string;
  
  // OTRAS RELACIONES Y CAMPOS
  direccion?: string;
  responsable: string;
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

export type VistaActiva = 'kanban' | 'dashboard' | 'agentes' | 'usuarios' | 'agenda' | 'misfolios';

export interface FiltrosGlobales {
  fechaInicio: string;
  fechaFin: string;
  score: ScoreFolio | 'Todos';
  responsableId: string | 'Todos';
}

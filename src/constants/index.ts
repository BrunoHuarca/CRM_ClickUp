import type { ColumnaKanban } from '../types';

export const COLUMNAS_KANBAN: ColumnaKanban[] = [
  {
    id: 'Captación',
    titulo: 'Captación',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-500',
  },
  {
    id: 'Comercial',
    titulo: 'Comercial',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconColor: 'text-amber-500',
  },
  {
    id: 'Legal',
    titulo: 'Legal',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-500',
  },
  {
    id: 'Firma',
    titulo: 'Firma',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    iconColor: 'text-cyan-500',
  },
  {
    id: 'Gerencia',
    titulo: 'Gerencia',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    iconColor: 'text-rose-500',
  },
  {
    id: 'Marketing',
    titulo: 'Marketing',
    color: 'text-fuchsia-700',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-300',
    iconColor: 'text-fuchsia-500',
  },
  {
    id: 'Publicado',
    titulo: 'Publicado',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'Cancelado',
    titulo: 'Cancelado',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    iconColor: 'text-slate-500',
  },
  {
    id: 'Vendido',
    titulo: 'Vendido',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-500',
  },
];

export const ESTADOS_ORDER = [
  'Captación',
  'Comercial',
  'Legal',
  'Firma',
  'Gerencia',
  'Marketing',
  'Publicado',
  'Cancelado',
  'Vendido',
] as const;

export const SCORE_CONFIG = {
  A: { label: 'Score A', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-500' },
  B: { label: 'Score B', color: 'bg-blue-100 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
  C: { label: 'Score C', color: 'bg-orange-100 text-orange-800 border-orange-200', dotColor: 'bg-orange-500' },
} as const;

export const TIPOS_INMUEBLE = [
  'Casa',
  'Departamento',
  'Terreno',
] as const;

export const TIPOS_ACTIVIDAD = [
  'Llamada',
  'Visita',
  'Validación',
  'Reunión',
  'Firma',
  'Seguimiento',
  'Otro',
] as const;

export const CATEGORIAS_COSTO = [
  'Gasolina',
  'Trámites',
  'Pauta Publicitaria',
  'Fotografía',
  'Notaría',
  'Comisión',
  'Otro',
] as const;

export const ACTIVIDAD_ICONS: Record<string, string> = {
  Llamada: '📞',
  Visita: '🏠',
  Validación: '✅',
  Reunión: '🤝',
  Firma: '✍️',
  Seguimiento: '🔄',
  Otro: '📌',
};

export const COSTO_ICONS: Record<string, string> = {
  Gasolina: '⛽',
  Trámites: '📄',
  'Pauta Publicitaria': '📢',
  Fotografía: '📷',
  Notaría: '⚖️',
  Comisión: '💵',
  Otro: '📎',
};

/** Days without activity before showing an alert */
export const DIAS_ALERTA_INACTIVIDAD = 7;

/** Maximum hours allowed per stage before triggering an alert */
export const TIEMPOS_MAXIMOS_ETAPA: Record<string, number> = {
  Captación: 72,   // 3 days
  Comercial: 120,  // 5 days
  Legal: 168,      // 7 days
  Firma: 120,      // 5 days
  Gerencia: 120,   // 5 days
  Marketing: 168,  // 7 days
  Publicado: 240,  // 10 days
};

export const ETAPA_LABELS: Record<string, string> = {
  Captación: 'Captación',
  Comercial: 'Comercial',
  Legal: 'Legal',
  Firma: 'Firma',
  Gerencia: 'Gerencia',
  Marketing: 'Marketing',
  Publicado: 'Publicado',
  Cancelado: 'Cancelado',
  Vendido: 'Vendido',
};

/* ========== RBAC CONFIG ========== */

export const ROLES_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  Admin: { label: 'Administrador', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
  Comercial: { label: 'Comercial', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  'Call Center': { label: 'Call Center', color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200' },
  Legal: { label: 'Legal', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  Gerencia: { label: 'Gerencia', color: 'text-rose-700', bgColor: 'bg-rose-100', borderColor: 'border-rose-200' },
  Marketing: { label: 'Marketing', color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-100', borderColor: 'border-fuchsia-200' },
};

export const AVATAR_GRADIENTS: Record<string, string> = {
  purple: 'from-purple-400 to-purple-600',
  blue: 'from-blue-400 to-blue-600',
  emerald: 'from-emerald-400 to-emerald-600',
  amber: 'from-amber-400 to-amber-600',
  rose: 'from-rose-400 to-rose-600',
  cyan: 'from-cyan-400 to-cyan-600',
  indigo: 'from-indigo-400 to-indigo-600',
  teal: 'from-teal-400 to-teal-600',
};

export interface Permisos {
  vistas: string[];
  etapasVisibles: string[];       // which kanban stages they can see
  puedeCrearFolio: boolean;
  puedeMoverFolio: boolean;
  puedeEliminarCosto: boolean;
  puedeCrearUsuarios: boolean;
  puedeVerRentabilidad: boolean;
}

export const PERMISOS_POR_ROL: Record<string, Permisos> = {
  Admin: {
    vistas: ['misfolios', 'kanban', 'dashboard', 'agentes', 'usuarios', 'agenda', 'miscompradores', 'kanbancompradores', 'agendacompradores', 'cartelerapropiedades'],
    etapasVisibles: ['Captación', 'Comercial', 'Legal', 'Firma', 'Gerencia', 'Marketing', 'Publicado', 'Cancelado', 'Vendido'],
    puedeCrearFolio: true,
    puedeMoverFolio: true,
    puedeEliminarCosto: true,
    puedeCrearUsuarios: true,
    puedeVerRentabilidad: true,
  },
  Comercial: {
    vistas: ['misfolios', 'kanban', 'dashboard', 'agentes', 'agenda', 'usuarios', 'miscompradores', 'kanbancompradores', 'agendacompradores', 'cartelerapropiedades'],
    etapasVisibles: ['Captación', 'Comercial', 'Legal', 'Firma', 'Gerencia', 'Marketing', 'Publicado', 'Cancelado', 'Vendido'],
    puedeCrearFolio: true,
    puedeMoverFolio: true,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: false,
  },
  'Call Center': {
    vistas: ['misfolios', 'kanban', 'agenda', 'usuarios', 'miscompradores', 'kanbancompradores', 'agendacompradores'],
    etapasVisibles: ['Captación'],
    puedeCrearFolio: true,
    puedeMoverFolio: false,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: false,
  },
  Legal: {
    vistas: ['misfolios', 'kanban', 'usuarios', 'miscompradores', 'kanbancompradores'],
    etapasVisibles: ['Legal', 'Vendido'],
    puedeCrearFolio: false,
    puedeMoverFolio: false,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: false,
  },
  Gerencia: {
    vistas: ['misfolios', 'kanban', 'dashboard', 'usuarios'],
    etapasVisibles: ['Gerencia', 'Vendido'],
    puedeCrearFolio: false,
    puedeMoverFolio: false,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: true,
  },
  Marketing: {
    vistas: ['misfolios', 'kanban', 'usuarios'],
    etapasVisibles: ['Marketing', 'Vendido'],
    puedeCrearFolio: false,
    puedeMoverFolio: false,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: false,
  },
};

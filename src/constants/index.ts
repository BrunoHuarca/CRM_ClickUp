import type { ColumnaKanban } from '../types';

export const COLUMNAS_KANBAN: ColumnaKanban[] = [
  {
    id: 'captacion',
    titulo: 'Captación',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-500',
  },
  {
    id: 'legal',
    titulo: 'Legal',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconColor: 'text-amber-500',
  },
  {
    id: 'marketing',
    titulo: 'Marketing',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-500',
  },
  {
    id: 'venta',
    titulo: 'Venta',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'cerrado',
    titulo: 'Cerrado',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    iconColor: 'text-slate-500',
  },
];

export const SCORE_CONFIG = {
  A: { label: 'Score A', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dotColor: 'bg-emerald-500' },
  B: { label: 'Score B', color: 'bg-blue-100 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
  C: { label: 'Score C', color: 'bg-orange-100 text-orange-800 border-orange-200', dotColor: 'bg-orange-500' },
} as const;

export const TIPOS_INMUEBLE = [
  'Casa',
  'Departamento',
  'Terreno',
  'Oficina',
  'Local Comercial',
  'Bodega',
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
  captacion: 72,   // 3 days
  legal: 120,      // 5 days
  marketing: 168,  // 7 days
  venta: 240,      // 10 days
};

export const ETAPA_LABELS: Record<string, string> = {
  captacion: 'Captación',
  legal: 'Legal',
  marketing: 'Marketing',
  venta: 'Venta',
  cerrado: 'Cerrado',
};

/* ========== RBAC CONFIG ========== */

export const ROLES_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  Admin: { label: 'Administrador', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
  Comercial: { label: 'Comercial', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  'Call Center': { label: 'Call Center', color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200' },
  Legal: { label: 'Legal', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
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
    vistas: ['kanban', 'dashboard', 'agentes', 'usuarios', 'agenda'],
    etapasVisibles: ['captacion', 'legal', 'marketing', 'venta', 'cerrado'],
    puedeCrearFolio: true,
    puedeMoverFolio: true,
    puedeEliminarCosto: true,
    puedeCrearUsuarios: true,
    puedeVerRentabilidad: true,
  },
  Comercial: {
    vistas: ['kanban', 'dashboard', 'agentes', 'agenda', 'usuarios'],
    etapasVisibles: ['captacion', 'legal', 'marketing', 'venta', 'cerrado'],
    puedeCrearFolio: true,
    puedeMoverFolio: true,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: false,
  },
  'Call Center': {
    vistas: ['kanban', 'agenda', 'usuarios'],
    etapasVisibles: ['captacion'],
    puedeCrearFolio: true,
    puedeMoverFolio: false,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: false,
  },
  Legal: {
    vistas: ['kanban', 'usuarios'],
    etapasVisibles: ['legal'],
    puedeCrearFolio: false,
    puedeMoverFolio: false,
    puedeEliminarCosto: false,
    puedeCrearUsuarios: false,
    puedeVerRentabilidad: false,
  },
};

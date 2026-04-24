import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Usuario } from '../types';
import { ROLES_CONFIG as DEFAULT_ROLES_CONFIG, PERMISOS_POR_ROL as DEFAULT_PERMISOS_POR_ROL, type Permisos } from '../constants';

export interface RolConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface UsuarioStore {
  usuarios: Usuario[];
  rolesConfig: Record<string, RolConfig>;
  permisosRoles: Record<string, Permisos>;
  usuarioActualId: string | null;
  initialized: boolean;

  // Actions
  agregarUsuario: (data: Omit<Usuario, 'id' | 'activo'>) => void;
  eliminarUsuario: (id: string) => void;
  setUsuarioActual: (id: string) => void;
  getUsuarioActual: () => Usuario | null;
  getPermisos: () => Permisos;
  
  // Roles Management
  guardarRol: (nombreRol: string, config: RolConfig, permisos: Permisos) => void;
  eliminarRol: (nombreRol: string) => void;
  
  inicializar: () => void;
}

const usuariosEjemplo: Usuario[] = [
  {
    id: 'user-001',
    nombre: 'Bruno Huarca',
    rol: 'Admin',
    avatar: 'BH',
    color: 'purple',
    activo: true,
  },
  {
    id: 'user-002',
    nombre: 'Carlos Mendoza',
    rol: 'Comercial',
    avatar: 'CM',
    color: 'blue',
    activo: true,
  },
  {
    id: 'user-003',
    nombre: 'Ana Torres',
    rol: 'Comercial',
    avatar: 'AT',
    color: 'emerald',
    activo: true,
  },
  {
    id: 'user-004',
    nombre: 'Pedro Villanueva',
    rol: 'Call Center',
    avatar: 'PV',
    color: 'amber',
    activo: true,
  },
  {
    id: 'user-005',
    nombre: 'Laura Díaz',
    rol: 'Legal',
    avatar: 'LD',
    color: 'rose',
    activo: true,
  },
];

const DEFAULT_PERMISOS: Permisos = DEFAULT_PERMISOS_POR_ROL['Admin'];

export const useUsuarioStore = create<UsuarioStore>()(
  persist(
    (set, get) => ({
      usuarios: [],
      rolesConfig: DEFAULT_ROLES_CONFIG,
      permisosRoles: DEFAULT_PERMISOS_POR_ROL,
      usuarioActualId: null,
      initialized: false,

      agregarUsuario: (data) => {
        const currentUser = get().getUsuarioActual();
        if (currentUser?.rol !== 'Admin') return;
        set((state) => ({
          usuarios: [
            ...state.usuarios,
            {
              ...data,
              id: uuidv4(),
              activo: true,
            },
          ],
        }));
      },

      eliminarUsuario: (id) => {
        const currentUser = get().getUsuarioActual();
        if (currentUser?.rol !== 'Admin') return;
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
          usuarioActualId: state.usuarioActualId === id ? state.usuarios[0]?.id || null : state.usuarioActualId,
        }));
      },

      setUsuarioActual: (id) => set({ usuarioActualId: id }),

      getUsuarioActual: () => {
        const { usuarios, usuarioActualId } = get();
        return usuarios.find((u) => u.id === usuarioActualId) || null;
      },

      getPermisos: () => {
        const usuario = get().getUsuarioActual();
        const permisosRoles = get().permisosRoles;
        if (!usuario) return DEFAULT_PERMISOS;
        return permisosRoles[usuario.rol] || DEFAULT_PERMISOS;
      },

      guardarRol: (nombreRol, config, permisos) => {
        const currentUser = get().getUsuarioActual();
        if (currentUser?.rol !== 'Admin') return;
        set((state) => ({
          rolesConfig: { ...state.rolesConfig, [nombreRol]: config },
          permisosRoles: { ...state.permisosRoles, [nombreRol]: permisos },
        }));
      },

      eliminarRol: (nombreRol) => {
        const currentUser = get().getUsuarioActual();
        if (currentUser?.rol !== 'Admin') return;
        set((state) => {
          const newRolesConfig = { ...state.rolesConfig };
          const newPermisosRoles = { ...state.permisosRoles };
          delete newRolesConfig[nombreRol];
          delete newPermisosRoles[nombreRol];
          return { rolesConfig: newRolesConfig, permisosRoles: newPermisosRoles };
        });
      },

      inicializar: () => {
        const { usuarios, initialized } = get();
        if (!initialized || usuarios.length === 0) {
          set({
            usuarios: usuariosEjemplo,
            rolesConfig: DEFAULT_ROLES_CONFIG,
            permisosRoles: DEFAULT_PERMISOS_POR_ROL,
            usuarioActualId: 'user-001', // Admin by default
            initialized: true,
          });
        }
      },
    }),
    {
      name: 'propify-usuarios-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Usuario } from '../types';
import { PERMISOS_POR_ROL, type Permisos } from '../constants';

interface UsuarioStore {
  usuarios: Usuario[];
  usuarioActualId: string | null;
  initialized: boolean;

  // Actions
  agregarUsuario: (data: Omit<Usuario, 'id' | 'activo'>) => void;
  eliminarUsuario: (id: string) => void;
  setUsuarioActual: (id: string) => void;
  getUsuarioActual: () => Usuario | null;
  getPermisos: () => Permisos;
  inicializar: () => void;
}

const usuariosEjemplo: Usuario[] = [
  {
    id: 'user-001',
    nombre: 'Bruno Martínez',
    rol: 'Admin',
    avatar: 'BM',
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

const DEFAULT_PERMISOS: Permisos = PERMISOS_POR_ROL['Admin'];

export const useUsuarioStore = create<UsuarioStore>()(
  persist(
    (set, get) => ({
      usuarios: [],
      usuarioActualId: null,
      initialized: false,

      agregarUsuario: (data) =>
        set((state) => ({
          usuarios: [
            ...state.usuarios,
            {
              ...data,
              id: uuidv4(),
              activo: true,
            },
          ],
        })),

      eliminarUsuario: (id) =>
        set((state) => ({
          usuarios: state.usuarios.filter((u) => u.id !== id),
          usuarioActualId: state.usuarioActualId === id ? state.usuarios[0]?.id || null : state.usuarioActualId,
        })),

      setUsuarioActual: (id) => set({ usuarioActualId: id }),

      getUsuarioActual: () => {
        const { usuarios, usuarioActualId } = get();
        return usuarios.find((u) => u.id === usuarioActualId) || null;
      },

      getPermisos: () => {
        const usuario = get().getUsuarioActual();
        if (!usuario) return DEFAULT_PERMISOS;
        return PERMISOS_POR_ROL[usuario.rol] || DEFAULT_PERMISOS;
      },

      inicializar: () => {
        const { usuarios, initialized } = get();
        if (!initialized || usuarios.length === 0) {
          set({
            usuarios: usuariosEjemplo,
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

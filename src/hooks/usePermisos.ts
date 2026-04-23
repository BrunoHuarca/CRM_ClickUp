import { useMemo } from 'react';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { PERMISOS_POR_ROL, type Permisos } from '../constants';

const DEFAULT_PERMISOS: Permisos = PERMISOS_POR_ROL['Admin'];

export function usePermisos(): Permisos {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);

  return useMemo(() => {
    const usuario = usuarios.find((u) => u.id === usuarioActualId);
    if (!usuario) return DEFAULT_PERMISOS;
    return PERMISOS_POR_ROL[usuario.rol] || DEFAULT_PERMISOS;
  }, [usuarios, usuarioActualId]);
}

export function useUsuarioActual() {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);

  return useMemo(() => {
    return usuarios.find((u) => u.id === usuarioActualId) || null;
  }, [usuarios, usuarioActualId]);
}

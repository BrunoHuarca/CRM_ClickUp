import { useMemo } from 'react';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { type Permisos } from '../constants';

export function usePermisos(): Permisos {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);
  const getPermisos = useUsuarioStore((s) => s.getPermisos);

  return useMemo(() => {
    return getPermisos();
  }, [usuarios, usuarioActualId, getPermisos]);
}

export function useUsuarioActual() {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);

  return useMemo(() => {
    return usuarios.find((u) => u.id === usuarioActualId) || null;
  }, [usuarios, usuarioActualId]);
}

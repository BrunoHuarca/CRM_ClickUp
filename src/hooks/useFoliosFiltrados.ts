import { useMemo } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';

export const useFoliosFiltrados = () => {
  const folios = useFolioStore((s) => s.folios);
  const filtros = useFolioStore((s) => s.filtros);
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);

  const usuarioActual = useMemo(() => 
    usuarios.find(u => u.id === usuarioActualId) || null,
  [usuarios, usuarioActualId]);

  return useMemo(() => {
    return folios.filter((folio) => {
      // 0. Filtrar por Rol (Seguridad)
      if (usuarioActual && usuarioActual.rol === 'Comercial') {
        if (folio.responsable !== usuarioActual.nombre) return false;
      }

      // 1. Filtrar por Responsable
      if (filtros.responsableId !== 'Todos') {
        if (folio.responsable !== filtros.responsableId) return false;
      }

      // 2. Filtrar por Score/Categoría
      if (filtros.score !== 'Todos') {
        if (folio.score !== filtros.score) return false;
      }

      // 3. Filtrar por Fechas
      if (filtros.fechaInicio) {
        const dInicio = new Date(filtros.fechaInicio);
        const dFolio = new Date(folio.fechaCreacion);
        if (dFolio < dInicio) return false;
      }

      if (filtros.fechaFin) {
        const dFin = new Date(filtros.fechaFin);
        // Ajustamos la fecha fin para abarcar todo el día (23:59:59)
        dFin.setHours(23, 59, 59, 999);
        const dFolio = new Date(folio.fechaCreacion);
        if (dFolio > dFin) return false;
      }

      return true;
    });
  }, [folios, filtros, usuarioActual]);
};

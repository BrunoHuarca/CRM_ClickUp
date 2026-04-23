import { useMemo } from 'react';
import { useFolioStore } from '../store/useFolioStore';

export const useFoliosFiltrados = () => {
  const folios = useFolioStore((s) => s.folios);
  const filtros = useFolioStore((s) => s.filtros);

  return useMemo(() => {
    return folios.filter((folio) => {
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
  }, [folios, filtros]);
};

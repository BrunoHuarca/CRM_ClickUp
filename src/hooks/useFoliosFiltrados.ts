import { useMemo } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { ESTADOS_ORDER } from '../constants';

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
      // 0. Filtrar por Cancelado (Solo Admin puede verlos)
      if (folio.estado === 'Cancelado' && usuarioActual?.rol !== 'Admin') {
        return false;
      }

      // 1. Filtrar por Rol (Seguridad)
      if (usuarioActual && usuarioActual.rol === 'Comercial') {
        const esCreador = folio.responsable === usuarioActual.nombre;
        const esAsignado = folio.responsablePrincipal === usuarioActual.nombre;
        if (!esCreador && !esAsignado) return false;
      }

      if (usuarioActual && usuarioActual.rol === 'Legal') {
        const idxActual = ESTADOS_ORDER.indexOf(folio.estado as any);
        const idxLegal = ESTADOS_ORDER.indexOf('Legal');
        const esSuEtapaOPosterior = idxActual >= idxLegal;
        const esCreador = folio.responsable === usuarioActual.nombre;
        if (!esSuEtapaOPosterior && !esCreador) return false;
      }

      if (usuarioActual && usuarioActual.rol === 'Marketing') {
        const idxActual = ESTADOS_ORDER.indexOf(folio.estado as any);
        const idxMkt = ESTADOS_ORDER.indexOf('Marketing');
        const esSuEtapaOPosterior = idxActual >= idxMkt;
        const esCreador = folio.responsable === usuarioActual.nombre;
        if (!esSuEtapaOPosterior && !esCreador) return false;
      }

      if (usuarioActual && usuarioActual.rol === 'Gerencia') {
        const idxActual = ESTADOS_ORDER.indexOf(folio.estado as any);
        const idxGer = ESTADOS_ORDER.indexOf('Gerencia');
        const esSuEtapaOPosterior = idxActual >= idxGer;
        const esCreador = folio.responsable === usuarioActual.nombre;
        if (!esSuEtapaOPosterior && !esCreador) return false;
      }

      if (usuarioActual && usuarioActual.rol === 'Call Center') {
        const esSuEtapa = folio.estado === 'Captación';
        const esCreador = folio.responsable === usuarioActual.nombre;
        if (!esSuEtapa && !esCreador) return false;
      }

      // Admin no tiene filtros de seguridad (ve todo)

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

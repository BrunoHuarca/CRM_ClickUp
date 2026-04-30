import { useMemo } from 'react';
import { useCompradorStore } from '../store/useCompradorStore';
import { useUsuarioStore } from '../store/useUsuarioStore';

export const useCompradoresFiltrados = () => {
  const compradores = useCompradorStore((s) => s.compradores);
  const filtros = useCompradorStore((s) => s.filtros);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);
  const usuarios = useUsuarioStore((s) => s.usuarios);

  const usuarioActual = useMemo(() => 
    usuarios.find(u => u.id === usuarioActualId)
  , [usuarioActualId, usuarios]);

  return useMemo(() => {

    return compradores.filter((comprador) => {
      // --- RBAC Visibility Rules ---
      if (usuarioActual && usuarioActual.rol !== 'Admin') {
        const { rol, nombre } = usuarioActual;

        // Call Center: Sees 'Captación' (Pending) and everything else (Atendidos)
        if (rol === 'Call Center') {
          // No filtering out by state here, we'll filter in the component tabs
        }

        // Comercial: Sees 'Comercial' and 'Firma' (Pending) and Cierre/Perdido (Atendidos)
        if (rol === 'Comercial') {
          const isAssigned = comprador.responsable === nombre;
          if (!isAssigned) return false;
        }

        // Legal: Sees 'Legal' (Pending) and anything that passed 'Legal' (Firma, Cierre, Perdido)
        if (rol === 'Legal') {
          const pastLegal = ['Legal', 'Firma', 'Cierre', 'Perdido'].includes(comprador.estado);
          if (!pastLegal) return false;
        }
      }

      // --- Store Filters ---
      // Filtro por Fecha
      if (filtros.fechaInicio && filtros.fechaFin) {
        const fechaComprador = new Date(comprador.fechaCreacion);
        const inicio = new Date(filtros.fechaInicio);
        const fin = new Date(filtros.fechaFin);
        fin.setHours(23, 59, 59); // Include entire end day
        if (fechaComprador < inicio || fechaComprador > fin) {
          return false;
        }
      }

      // Filtro por Score
      if (filtros.score !== 'Todos' && comprador.score !== filtros.score) {
        return false;
      }

      // Filtro por Responsable
      if (filtros.responsableId !== 'Todos' && comprador.responsable !== filtros.responsableId) {
        return false;
      }

      return true;
    });
  }, [compradores, filtros, usuarioActual]);
};

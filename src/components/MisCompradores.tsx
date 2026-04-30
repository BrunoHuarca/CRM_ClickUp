import { type FC, useState, useMemo } from 'react';
import { useCompradorStore } from '../store/useCompradorStore';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useCompradoresFiltrados } from '../hooks/useCompradoresFiltrados';
import { SCORE_CONFIG } from '../constants';
import type { EstadoComprador } from '../types';

type TabFiltro = 'pendientes' | 'firma' | 'atendidos' | EstadoComprador;

const MisCompradores: FC = () => {
  const compradoresFiltrados = useCompradoresFiltrados();
  const abrirDetalle = useCompradorStore((s) => s.abrirDetalle);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);
  const usuarios = useUsuarioStore((s) => s.usuarios);

  const usuarioActual = useMemo(() => 
    usuarios.find(u => u.id === usuarioActualId)
  , [usuarioActualId, usuarios]);

  const rol = usuarioActual?.rol || 'Admin';

  const [tabActiva, setTabActiva] = useState<TabFiltro>(rol === 'Admin' ? 'Captación' : 'pendientes');

  const compradoresVisibles = useMemo(() => {
    return compradoresFiltrados.filter((c) => {
      if (rol === 'Admin') {
        // Para Admin, la pestaña es el estado exacto
        return c.estado === tabActiva;
      }

      // --- Lógica para Roles Operativos ---
      if (tabActiva === 'atendidos') {
        if (rol === 'Call Center') return c.estado !== 'Captación';
        if (rol === 'Comercial') return c.estado === 'Legal' || c.estado === 'Cierre' || c.estado === 'Perdido';
        if (rol === 'Legal') return c.estado === 'Firma' || c.estado === 'Cierre' || c.estado === 'Perdido';
        return false;
      }

      if (tabActiva === 'firma') return c.estado === 'Firma';

      if (tabActiva === 'pendientes') {
        if (rol === 'Call Center') return c.estado === 'Captación';
        if (rol === 'Comercial') return c.estado === 'Comercial';
        if (rol === 'Legal') return c.estado === 'Legal';
      }

      return true;
    });
  }, [compradoresFiltrados, tabActiva, rol]);

  const renderTabs = () => {
    if (rol === 'Admin') {
      const estados: EstadoComprador[] = ['Captación', 'Comercial', 'Legal', 'Firma', 'Cierre', 'Perdido'];
      return (
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-sm border border-surface-200 mb-6 w-full sm:w-fit">
          {estados.map((est) => (
            <button
              key={est}
              onClick={() => setTabActiva(est)}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                tabActiva === est
                  ? 'bg-surface-100 border-primary-500 text-primary-600 shadow-inner'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              {est}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-sm border border-surface-200 mb-6 w-full sm:w-fit">
        <button
          onClick={() => setTabActiva('pendientes')}
          className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            tabActiva === 'pendientes'
              ? 'bg-surface-100 border-[#047D7D] text-[#047D7D] shadow-inner'
              : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
          }`}
        >
          Pendientes
        </button>
        
        {rol === 'Comercial' && (
          <button
            onClick={() => setTabActiva('firma')}
            className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              tabActiva === 'firma'
                ? 'bg-surface-100 border-purple-500 text-purple-600 shadow-inner'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
            }`}
          >
            Pendiente Firma
          </button>
        )}

        <button
          onClick={() => setTabActiva('atendidos')}
          className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
            tabActiva === 'atendidos'
              ? 'bg-surface-100 border-emerald-500 text-emerald-600 shadow-inner'
              : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
          }`}
        >
          Atendidos
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface-100 flex-1 overflow-x-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Bandeja de Entrada</h2>
          <p className="text-sm text-surface-500 mt-1">
            Viendo bandeja como: <span className="font-bold text-[#047D7D]">{rol}</span>
          </p>
        </div>
        <button
          onClick={() => useFolioStore.getState().setVistaActiva('cartelerapropiedades')}
          className="bg-white border border-surface-200 px-4 py-2 rounded-xl text-xs font-bold text-surface-600 hover:bg-surface-50 transition-smooth shadow-sm"
        >
          Ver Cartelera de Propiedades
        </button>
      </div>

      {/* Dynamic Tabs */}
      {renderTabs()}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#047D7D] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Inversión Est.</th>
                <th className="px-6 py-4 font-semibold">Tipo Busca</th>
                <th className="px-6 py-4 font-semibold">Responsable</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 text-[#4A494A]">
              {compradoresVisibles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-surface-500 font-medium">No hay clientes en esta sección ({tabActiva})</p>
                  </td>
                </tr>
              ) : (
                compradoresVisibles.map((comprador) => {
                  const scoreConfig = SCORE_CONFIG[comprador.score];
                  return (
                    <tr
                      key={comprador.id}
                      onClick={() => abrirDetalle(comprador.id)}
                      className="hover:bg-surface-50 transition-smooth cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs">{comprador.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium">{comprador.nombre}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-emerald-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(comprador.inversionEstimada)}
                      </td>
                      <td className="px-6 py-4 text-xs">{comprador.tipoInmuebleBusca}</td>
                      <td className="px-6 py-4 text-xs font-medium text-surface-500">{comprador.responsable}</td>
                      <td className="px-6 py-4">
                        <span className="bg-surface-100 text-surface-700 px-2.5 py-1 rounded-md text-[10px] font-bold border border-surface-200 uppercase">
                          {comprador.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${scoreConfig.color}`}
                        >
                          {comprador.score}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-surface-50 border-t border-surface-200 px-6 py-3 shrink-0">
          <p className="text-xs text-surface-500 font-medium">
            Mostrando {compradoresVisibles.length} registros para la pestaña actual.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MisCompradores;

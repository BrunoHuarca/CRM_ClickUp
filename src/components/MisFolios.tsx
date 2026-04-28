import { type FC, useState, useMemo } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioActual } from '../hooks/usePermisos';
import { useFoliosFiltrados } from '../hooks/useFoliosFiltrados';
import { SCORE_CONFIG, ESTADOS_ORDER } from '../constants';
import type { EstadoFolio } from '../types';

const MisFolios: FC = () => {
  const foliosFiltrados = useFoliosFiltrados();
  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const usuario = useUsuarioActual();

  const [verTodos, setVerTodos] = useState(false);
  
  const isAdmin = usuario?.rol === 'Admin';
  const isComercial = usuario?.rol === 'Comercial';

  const [tabActiva, setTabActiva] = useState<string>(isAdmin ? 'Captación' : 'pendientes');

  // Determinar el estado "objetivo" según el rol
  const getEstadoObjetivo = (rol: string): EstadoFolio => {
    switch (rol) {
      case 'Call Center': return 'Captación';
      case 'Comercial': return 'Comercial';
      case 'Legal': return 'Legal';
      case 'Gerencia': return 'Gerencia';
      case 'Marketing': return 'Marketing';
      default: return 'Captación';
    }
  };

  const estadoObjetivo = usuario ? getEstadoObjetivo(usuario.rol) : 'Captación';
  const indexObjetivo = ESTADOS_ORDER.indexOf(estadoObjetivo);

  const foliosVisibles = useMemo(() => {
    let baseFolios = foliosFiltrados;
    
    // Si es Admin y NO quiere ver todos, filtramos por los que él registró
    if (isAdmin && !verTodos) {
      baseFolios = foliosFiltrados.filter(
        (f) => f.responsable === usuario?.nombre
      );
    }

    // Filtro por pestañas
    return baseFolios.filter((f) => {
      if (isAdmin) {
        return f.estado === tabActiva;
      }

      const indexActual = ESTADOS_ORDER.indexOf(f.estado);
      
      if (tabActiva === 'firma') {
        return f.estado === 'Firma';
      }
      
      if (tabActiva === 'pendientes') {
        return f.estado === estadoObjetivo;
      }
      
      if (tabActiva === 'atendidos') {
        // Atendido es cualquier estado posterior al objetivo
        // Si es comercial, 'Firma' tiene su propia pestaña, así que lo excluimos de Atendidos
        if (isComercial && f.estado === 'Firma') return false;
        return indexActual > indexObjetivo;
      }
      
      return true;
    });
  }, [foliosFiltrados, usuario, isAdmin, verTodos, tabActiva, estadoObjetivo, indexObjetivo, isComercial]);

  const tabs = useMemo(() => {
    if (isAdmin) {
      return ESTADOS_ORDER.map((e) => ({
        id: e,
        label: e,
        color: 'border-[#047D7D] text-[#047D7D]',
      }));
    }

    const baseTabs = [
      { id: 'pendientes', label: 'Pendientes', color: 'border-orange-500 text-orange-600' },
      { id: 'atendidos', label: 'Atendidos', color: 'border-emerald-500 text-emerald-600' },
    ];

    if (isComercial) {
      baseTabs.push({ id: 'firma', label: 'Pendiente de Firma', color: 'border-blue-500 text-blue-600' });
    }
    
    return baseTabs;
  }, [isAdmin, isComercial]);

  return (
    <div className="flex flex-col h-full bg-surface-100 flex-1 overflow-x-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Bandeja de Entrada</h2>
          <p className="text-sm text-surface-500 mt-1">
            Gestiona los folios según su etapa actual.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-surface-200">
              <span className={`text-xs font-semibold ${!verTodos ? 'text-[#047D7D]' : 'text-surface-400'}`}>Solo Míos</span>
              <button
                onClick={() => setVerTodos(!verTodos)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                  verTodos ? 'bg-[#047D7D]' : 'bg-surface-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    verTodos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold ${verTodos ? 'text-[#047D7D]' : 'text-surface-400'}`}>Ver Todos</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-sm border border-surface-200 mb-6 w-full sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              tabActiva === tab.id
                ? `bg-surface-100 ${tab.color.split(' ')[1]} shadow-inner`
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#047D7D] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">ID Folio</th>
                <th className="px-6 py-4 font-semibold">Propietario</th>
                <th className="px-6 py-4 font-semibold">Inmueble</th>
                <th className="px-6 py-4 font-semibold">Registrado Por</th>
                <th className="px-6 py-4 font-semibold">Comercial</th>
                <th className="px-6 py-4 font-semibold">Estado Actual</th>
                <th className="px-6 py-4 font-semibold text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 text-[#4A494A]">
              {foliosVisibles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-surface-500 font-medium">No hay folios en esta sección</p>
                  </td>
                </tr>
              ) : (
                foliosVisibles.map((folio) => {
                  const scoreConfig = SCORE_CONFIG[folio.score];
                  return (
                    <tr
                      key={folio.id}
                      onClick={() => abrirDetalle(folio.id)}
                      className="hover:bg-surface-50 transition-smooth cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs">{folio.id.split('-')[0]}...</td>
                      <td className="px-6 py-4 font-medium">{folio.propietarioNombre || '—'}</td>
                      <td className="px-6 py-4 text-xs">{folio.tipoInmueble}</td>
                      <td className="px-6 py-4 text-xs font-medium text-surface-500">{folio.responsable}</td>
                      <td className="px-6 py-4 text-xs font-bold text-[#047D7D]">{folio.responsablePrincipal || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-surface-100 text-surface-700 px-2.5 py-1 rounded-md text-[10px] font-bold border border-surface-200 uppercase">
                          {folio.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${scoreConfig.color}`}
                        >
                          {folio.score}
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
            Total listados: {foliosVisibles.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MisFolios;

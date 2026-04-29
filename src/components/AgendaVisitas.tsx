import { type FC, useMemo, useState } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { SCORE_CONFIG } from '../constants';
import FiltrosGlobales from './FiltrosGlobales';

const AgendaVisitas: FC = () => {
  const folios = useFolioStore((s) => s.folios);
  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const usuarioActual = useUsuarioStore((s) => s.getUsuarioActual());
  const [filtroAgente, setFiltroAgente] = useState<string>(() => {
    if (usuarioActual?.rol === 'Admin' || usuarioActual?.rol === 'Gerencia') return '';
    return usuarioActual?.nombre || '';
  });
  const [filtroFecha, setFiltroFecha] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Extraer las visitas programadas de los folios en estado Comercial
  const visitas = useMemo(() => {
    return folios
      .filter((f) => f.estado === 'Comercial' && f.visitaProgramada)
      .map((f) => {
        const dateObj = new Date(f.visitaProgramada);
        return {
          id: `pv-${f.id}`,
          folioId: f.id,
          tipo: 'Visita',
          fecha: f.visitaProgramada,
          horaInicio: dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false }),
          horaFin: '',
          responsable: f.responsablePrincipal || 'Sin asignar',
          score: f.score || 'C',
          direccion: f.direccion,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateA.getTime() - dateB.getTime();
      });
  }, [folios]);

  // Extraer lista de comerciales para el <select>
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const comerciales = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === 'Comercial' && u.activo)
      .map((u) => u.nombre)
      .sort();
  }, [usuarios]);

  // Aplicar filtros
  const visitasFiltradas = useMemo(() => {
    return visitas.filter((v) => {
      const matchAgente = !filtroAgente || v.responsable === filtroAgente;
      const matchFecha = !filtroFecha || v.fecha.startsWith(filtroFecha);
      return matchAgente && matchFecha;
    });
  }, [visitas, filtroAgente, filtroFecha]);

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-surface-800">Agenda de Visitas</h2>
        <p className="text-sm text-surface-500 mt-1 mb-4">
          Visualiza las visitas programadas y gestiona tu agenda diaria
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
          <h3 className="font-semibold text-surface-700">Cronograma</h3>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 font-medium whitespace-nowrap">Fecha:</span>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="bg-white border border-surface-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-700 font-medium"
              />
            </div>

            {(usuarioActual?.rol === 'Admin' || usuarioActual?.rol === 'Gerencia') && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-500 font-medium whitespace-nowrap">Agente:</span>
                <select
                  value={filtroAgente}
                  onChange={(e) => setFiltroAgente(e.target.value)}
                  className="bg-white border border-surface-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-700 font-medium"
                >
                  <option value="">Todos</option>
                  {comerciales.map((agente) => (
                    <option key={agente} value={agente}>
                      {agente}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {visitasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-surface-400">
              <span className="text-4xl opacity-50 mb-3">📅</span>
              <p className="text-sm font-medium">No hay visitas programadas</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-surface-200 ml-4 space-y-6 py-2">
              {visitasFiltradas.map((visita, idx) => {
                const scoreConfig = SCORE_CONFIG[visita.score];
                return (
                  <div key={`${visita.id}-${idx}`} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white"></div>
                    
                    <div 
                      className="bg-white border border-surface-200 rounded-xl p-4 hover:shadow-md transition-smooth cursor-pointer"
                      onClick={() => abrirDetalle(visita.folioId, true)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🏠</span>
                          <div>
                            <p className="text-xs font-bold text-surface-800">
                              Visita Programada
                            </p>
                            <p className="text-[11px] text-surface-500 font-medium">
                              {new Date(visita.fecha).toLocaleDateString('es-PE', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'long',
                              })}
                              {visita.horaInicio && (
                                <span className="ml-1 text-primary-600 font-semibold bg-primary-50 px-1.5 py-0.5 rounded">
                                  {visita.horaInicio}{visita.horaFin ? ` - ${visita.horaFin}` : ''}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scoreConfig.color}`}>
                          <span className={`w-1 h-1 rounded-full ${scoreConfig.dotColor}`}></span>
                          {visita.score}
                        </span>
                      </div>

                      {visita.direccion && (
                        <p className="mt-2 text-[10px] text-surface-500 flex items-center gap-1">
                          <span>📍</span> {visita.direccion}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold">
                              {visita.responsable.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-surface-700">
                            {visita.responsable}
                          </span>
                        </div>
                        <span className="text-[10px] bg-surface-100 text-surface-600 px-2 py-1 rounded font-mono border border-surface-200">
                          {visita.folioId.slice(0, 8)}
                        </span>
                      </div>
                      
                      {visita.resultado && (
                        <p className="mt-3 text-xs text-surface-500 bg-surface-50 p-2 rounded-lg italic">
                          {visita.resultado}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaVisitas;

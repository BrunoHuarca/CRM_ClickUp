import { type FC, useMemo, useState, useEffect } from 'react';
import { useCompradorStore } from '../store/useCompradorStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { SCORE_CONFIG } from '../constants';

const AgendaCompradores: FC = () => {
  const compradores = useCompradorStore((s) => s.compradores);
  const abrirDetalle = useCompradorStore((s) => s.abrirDetalle);
  const usuarioActual = useUsuarioStore((s) => s.getUsuarioActual());
  const [filtroAgente, setFiltroAgente] = useState<string>('');
  const [filtroFecha, setFiltroFecha] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (usuarioActual && !filtroAgente) {
      if (usuarioActual.rol !== 'Admin' && usuarioActual.rol !== 'Gerencia') {
        setFiltroAgente(usuarioActual.nombre);
      }
    }
  }, [usuarioActual]);

  // Extraer las actividades de los compradores
  const actividades = useMemo(() => {
    return compradores
      .flatMap((c) => 
        (c.actividades || []).map(a => ({
          ...a,
          compradorId: c.id,
          compradorNombre: c.nombre,
          score: c.score,
        }))
      )
      .sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateA.getTime() - dateB.getTime();
      });
  }, [compradores]);

  const usuarios = useUsuarioStore((s) => s.usuarios);
  const comerciales = useMemo(() => {
    return usuarios
      .filter((u) => u.rol === 'Comercial' && u.activo)
      .map((u) => u.nombre)
      .sort();
  }, [usuarios]);

  const actividadesFiltradas = useMemo(() => {
    return actividades.filter((a) => {
      const matchAgente = !filtroAgente || a.responsable === filtroAgente;
      const matchFecha = !filtroFecha || a.fecha.startsWith(filtroFecha);
      return matchAgente && matchFecha;
    });
  }, [actividades, filtroAgente, filtroFecha]);

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-surface-800">Agenda de Compradores</h2>
        <p className="text-sm text-surface-500 mt-1 mb-4">
          Visualiza las actividades programadas con clientes compradores
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
          <h3 className="font-semibold text-surface-700">Cronograma de Actividades</h3>
          
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
          {actividadesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-surface-400">
              <span className="text-4xl opacity-50 mb-3">📅</span>
              <p className="text-sm font-medium">No hay actividades programadas</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-surface-200 ml-4 space-y-6 py-2">
              {actividadesFiltradas.map((actividad, idx) => {
                const scoreConfig = SCORE_CONFIG[actividad.score as keyof typeof SCORE_CONFIG] || SCORE_CONFIG.C;
                return (
                  <div key={`${actividad.id}-${idx}`} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white"></div>
                    
                    <div 
                      className="bg-white border border-surface-200 rounded-xl p-4 hover:shadow-md transition-smooth cursor-pointer"
                      onClick={() => abrirDetalle(actividad.compradorId, true)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {actividad.tipo === 'Visita' ? '🏠' : actividad.tipo === 'Llamada' ? '📞' : actividad.tipo === 'Reunión' ? '🤝' : '📝'}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-surface-800">
                              {actividad.tipo}
                            </p>
                            <p className="text-[11px] text-surface-500 font-medium">
                              {new Date(actividad.fecha).toLocaleDateString('es-PE', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'long',
                              })}
                              {actividad.horaInicio && (
                                <span className="ml-1 text-primary-600 font-semibold bg-primary-50 px-1.5 py-0.5 rounded">
                                  {actividad.horaInicio}{actividad.horaFin ? ` - ${actividad.horaFin}` : ''}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scoreConfig.color}`}>
                          <span className={`w-1 h-1 rounded-full ${scoreConfig.dotColor}`}></span>
                          {actividad.score}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold">
                              {actividad.responsable.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-surface-700">
                            {actividad.responsable}
                          </span>
                        </div>
                        <span className="text-[10px] bg-surface-100 text-surface-600 px-2 py-1 rounded font-mono border border-surface-200">
                          {actividad.compradorNombre}
                        </span>
                      </div>
                      
                      {actividad.resultado && (
                        <p className="mt-3 text-xs text-surface-500 bg-surface-50 p-2 rounded-lg italic">
                          {actividad.resultado}
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

export default AgendaCompradores;

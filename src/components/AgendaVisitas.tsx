import { type FC, useMemo, useState } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { SCORE_CONFIG } from '../constants';
import FiltrosGlobales from './FiltrosGlobales';

const AgendaVisitas: FC = () => {
  const folios = useFolioStore((s) => s.folios);
  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const [filtroAgente, setFiltroAgente] = useState<string>('');

  // Extraer todas las visitas de todos los folios y ordenarlas cronológicamente
  const visitas = useMemo(() => {
    const allVisits = folios.flatMap((folio) =>
      folio.actividades
        .filter((act) => act.tipo === 'Visita')
        .map((act) => ({
          ...act,
          folioId: folio.id,
          score: folio.score,
        }))
    );

    // Ordenar de más reciente a más antigua o futura a pasada. Mejor orden cronológico (futuro a pasado o pasado a futuro)
    // El prompt pide listar todas las del mes ordenadas: vamos a ordenarlas por fecha y hora
    return allVisits.sort((a, b) => {
      const dateA = new Date(`${a.fecha.split('T')[0]}T${a.horaInicio || '00:00'}`);
      const dateB = new Date(`${b.fecha.split('T')[0]}T${b.horaInicio || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [folios]);

  // Extraer lista única de agentes programados para el <select>
  const agentesUnicos = useMemo(() => {
    return Array.from(new Set(visitas.map((v) => v.responsable))).sort();
  }, [visitas]);

  // Aplicar filtro si existe
  const visitasFiltradas = useMemo(() => {
    if (!filtroAgente) return visitas;
    return visitas.filter((v) => v.responsable === filtroAgente);
  }, [visitas, filtroAgente]);

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-surface-800">Agenda de Visitas</h2>
        <p className="text-sm text-surface-500 mt-1 mb-4">
          Visualiza todas las visitas programadas para los folios
        </p>
        <FiltrosGlobales />
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
          <h3 className="font-semibold text-surface-700">Cronograma</h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-500 font-medium whitespace-nowrap">Filtrar por Agente:</span>
            <select
              value={filtroAgente}
              onChange={(e) => setFiltroAgente(e.target.value)}
              className="bg-white border border-surface-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-700 font-medium"
            >
              <option value="">Todos los Agentes</option>
              {agentesUnicos.map((agente) => (
                <option key={agente} value={agente}>
                  {agente}
                </option>
              ))}
            </select>
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
                      onClick={() => abrirDetalle(visita.folioId)}
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
                              {visita.horaInicio && visita.horaFin && (
                                <span className="ml-1 text-primary-600 font-semibold bg-primary-50 px-1.5 py-0.5 rounded">
                                  {visita.horaInicio} - {visita.horaFin}
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

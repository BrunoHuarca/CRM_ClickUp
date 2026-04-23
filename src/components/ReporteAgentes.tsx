import { type FC, useMemo, useState } from 'react';
import { ETAPA_LABELS } from '../constants';
import { useFoliosFiltrados } from '../hooks/useFoliosFiltrados';
import FiltrosGlobales from './FiltrosGlobales';
import { exportarAExcel } from '../utils/export';

interface AgenteStats {
  nombre: string;
  totalFolios: number;
  foliosCerrados: number;
  foliosActivos: number;
  conversionRate: number;
  ingresoTotal: number;
  costoTotal: number;
  utilidad: number;
  foliosPorEtapa: Record<string, number>;
  ranking: number;
  scorePromedio: string;
}

const ReporteAgentes: FC = () => {
  const folios = useFoliosFiltrados();
  const [sortBy, setSortBy] = useState<'ranking' | 'folios' | 'conversion' | 'utilidad'>('ranking');

  const agentesData = useMemo(() => {
    // Collect unique agents from both folio.responsable and actividades.responsable
    const agentesMap = new Map<string, AgenteStats>();

    folios.forEach((folio) => {
      const nombre = folio.responsable;
      if (!agentesMap.has(nombre)) {
        agentesMap.set(nombre, {
          nombre,
          totalFolios: 0,
          foliosCerrados: 0,
          foliosActivos: 0,
          conversionRate: 0,
          ingresoTotal: 0,
          costoTotal: 0,
          utilidad: 0,
          foliosPorEtapa: {},
          ranking: 0,
          scorePromedio: 'B',
        });
      }

      const agent = agentesMap.get(nombre)!;
      agent.totalFolios++;

      if (folio.estado === 'cerrado') {
        agent.foliosCerrados++;
      } else {
        agent.foliosActivos++;
      }

      agent.ingresoTotal += folio.precio || 0;
      agent.costoTotal += (folio.costos || []).reduce((sum, c) => sum + c.monto, 0);

      const etapa = folio.estado;
      agent.foliosPorEtapa[etapa] = (agent.foliosPorEtapa[etapa] || 0) + 1;
    });

    // Calculate conversion rates and rankings
    const agentes = Array.from(agentesMap.values()).map((agent) => {
      agent.conversionRate =
        agent.totalFolios > 0 ? (agent.foliosCerrados / agent.totalFolios) * 100 : 0;
      agent.utilidad = agent.ingresoTotal - agent.costoTotal;

      // Calculate average score
      const agentFolios = folios.filter((f) => f.responsable === agent.nombre);
      const scoreValues = agentFolios.map((f) => (f.score === 'A' ? 3 : f.score === 'B' ? 2 : 1));
      const avgScore = scoreValues.length > 0
        ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
        : 2;
      agent.scorePromedio = avgScore >= 2.5 ? 'A' : avgScore >= 1.5 ? 'B' : 'C';

      return agent;
    });

    // Sort by composite score: conversion weight + volume weight + utilidad weight
    agentes.sort((a, b) => {
      const scoreA = a.conversionRate * 0.4 + a.totalFolios * 10 * 0.3 + (a.utilidad / 1000000) * 0.3;
      const scoreB = b.conversionRate * 0.4 + b.totalFolios * 10 * 0.3 + (b.utilidad / 1000000) * 0.3;
      return scoreB - scoreA;
    });

    agentes.forEach((agent, i) => {
      agent.ranking = i + 1;
    });

    // Apply user sort
    if (sortBy === 'folios') {
      agentes.sort((a, b) => b.totalFolios - a.totalFolios);
    } else if (sortBy === 'conversion') {
      agentes.sort((a, b) => b.conversionRate - a.conversionRate);
    } else if (sortBy === 'utilidad') {
      agentes.sort((a, b) => b.utilidad - a.utilidad);
    }

    return agentes;
  }, [folios, sortBy]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(val);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (rank === 2) return { emoji: '🥈', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    if (rank === 3) return { emoji: '🥉', color: 'bg-orange-100 text-orange-700 border-orange-300' };
    return { emoji: `#${rank}`, color: 'bg-surface-100 text-surface-600 border-surface-200' };
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 50) return 'text-emerald-600 bg-emerald-50';
    if (rate >= 25) return 'text-blue-600 bg-blue-50';
    if (rate > 0) return 'text-amber-600 bg-amber-50';
    return 'text-surface-500 bg-surface-50';
  };

  // Summary stats
  const totalAgentes = agentesData.length;
  const promedioConversion =
    totalAgentes > 0
      ? agentesData.reduce((sum, a) => sum + a.conversionRate, 0) / totalAgentes
      : 0;
  const totalFoliosAsignados = agentesData.reduce((sum, a) => sum + a.totalFolios, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface-50">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Reporte de Agentes</h2>
          <p className="text-sm text-surface-500 mt-1">
            Productividad, conversión y ranking interno del equipo (datos filtrados)
          </p>
        </div>
        <button
          onClick={() => exportarAExcel(agentesData, 'Reporte_Productividad_Agentes')}
          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold transition-smooth shadow-sm cursor-pointer flex items-center gap-2 max-w-fit"
        >
          <span className="text-lg">📥</span> Exportar Equipo
        </button>
      </div>

      <div className="mb-8">
        <FiltrosGlobales />
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 animate-slide-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                Agentes Activos
              </p>
              <p className="text-3xl font-bold text-surface-800 mt-1">{totalAgentes}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <span className="text-lg">👥</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 animate-slide-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                Folios Asignados
              </p>
              <p className="text-3xl font-bold text-surface-800 mt-1">{totalFoliosAsignados}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-lg">📁</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 animate-slide-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                Conversión Promedio
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{promedioConversion.toFixed(1)}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-lg">📈</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 animate-slide-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
                Top Agente
              </p>
              <p className="text-lg font-bold text-surface-800 mt-1 truncate">
                {agentesData[0]?.nombre || '—'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-lg">🏆</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden animate-slide-in">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-surface-800">Tabla de Productividad</h3>
            <p className="text-xs text-surface-400">Ranking calculado por conversión, volumen y utilidad</p>
          </div>
          <div className="flex gap-1 bg-surface-100 p-1 rounded-lg">
            {[
              { id: 'ranking' as const, label: 'Ranking' },
              { id: 'folios' as const, label: 'Folios' },
              { id: 'conversion' as const, label: 'Conversión' },
              { id: 'utilidad' as const, label: 'Utilidad' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-smooth cursor-pointer ${
                  sortBy === s.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Ranking
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Agente
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Folios
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Cerrados
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Conversión
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Score Prom.
                </th>
                <th className="text-right px-6 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Utilidad
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                  Distribución
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {agentesData.map((agente) => {
                const rank = getRankBadge(agente.ranking);
                const convColor = getConversionColor(agente.conversionRate);

                return (
                  <tr
                    key={agente.nombre}
                    className="hover:bg-surface-50 transition-smooth"
                  >
                    {/* Ranking */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${rank.color}`}
                      >
                        {rank.emoji}
                      </span>
                    </td>

                    {/* Agent Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-sm">
                            {agente.nombre
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-800">
                            {agente.nombre}
                          </p>
                          <p className="text-[10px] text-surface-400">
                            {agente.foliosActivos} activos
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total Folios */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-surface-700">
                        {agente.totalFolios}
                      </span>
                    </td>

                    {/* Cerrados */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-emerald-600">
                        {agente.foliosCerrados}
                      </span>
                    </td>

                    {/* Conversion */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${convColor}`}
                      >
                        {agente.conversionRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold ${
                          agente.scorePromedio === 'A'
                            ? 'bg-emerald-100 text-emerald-700'
                            : agente.scorePromedio === 'B'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {agente.scorePromedio}
                      </span>
                    </td>

                    {/* Utilidad */}
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-bold ${
                          agente.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(agente.utilidad)}
                      </span>
                    </td>

                    {/* Distribution Mini Bars */}
                    <td className="px-4 py-4">
                      <div className="flex gap-0.5 items-center">
                        {Object.entries(agente.foliosPorEtapa).map(([etapa, count]) => (
                          <div key={etapa} className="group relative">
                            <div
                              className={`h-6 rounded-sm min-w-[14px] flex items-center justify-center text-[8px] font-bold text-white ${
                                etapa === 'captacion'
                                  ? 'bg-blue-500'
                                  : etapa === 'legal'
                                  ? 'bg-amber-500'
                                  : etapa === 'marketing'
                                  ? 'bg-purple-500'
                                  : etapa === 'venta'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-500'
                              }`}
                              style={{ width: `${count * 18}px` }}
                            >
                              {count}
                            </div>
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-900 text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap z-10">
                              {ETAPA_LABELS[etapa] || etapa}: {count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {agentesData.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block opacity-30">👥</span>
            <p className="text-sm text-surface-400">No hay agentes registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteAgentes;

import { type FC, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import { usePermisos } from '../hooks/usePermisos';
import { useFoliosFiltrados } from '../hooks/useFoliosFiltrados';
import FiltrosGlobales from './FiltrosGlobales';
import { COLUMNAS_KANBAN, SCORE_CONFIG } from '../constants';
import type { EstadoFolio, ScoreFolio } from '../types';
import { exportarAExcel } from '../utils/export';

const ETAPA_COLORS: Record<EstadoFolio, string> = {
  captacion: '#3b82f6',
  legal: '#f59e0b',
  marketing: '#8b5cf6',
  venta: '#10b981',
  cerrado: '#64748b',
};

const SCORE_COLORS: Record<ScoreFolio, string> = {
  A: '#10b981',
  B: '#3b82f6',
  C: '#f97316',
};

const Dashboard: FC = () => {
  const folios = useFoliosFiltrados();
  const permisos = usePermisos();

  const dataPorEtapa = useMemo(() => {
    return COLUMNAS_KANBAN.map((col) => ({
      name: col.titulo,
      cantidad: folios.filter((f) => f.estado === col.id).length,
      color: ETAPA_COLORS[col.id],
    }));
  }, [folios]);

  const dataPorScore = useMemo(() => {
    const scores: ScoreFolio[] = ['A', 'B', 'C'];
    return scores.map((score) => ({
      name: `Score ${score}`,
      value: folios.filter((f) => f.score === score).length,
      color: SCORE_COLORS[score],
    }));
  }, [folios]);

  // Profitability data per folio
  const dataRentabilidad = useMemo(() => {
    return folios
      .filter((f) => f.precio && f.precio > 0)
      .map((f) => {
        const totalCostos = (f.costos || []).reduce((sum, c) => sum + c.monto, 0);
        const utilidad = (f.precio || 0) - totalCostos;
        return {
          name: `${f.tipoInmueble.substring(0, 4)}. ${f.propietario.split(' ')[0]}`,
          ingreso: f.precio || 0,
          costos: totalCostos,
          utilidad,
          folioId: f.id,
        };
      });
  }, [folios]);

  const totalFolios = folios.length;
  const foliosActivos = folios.filter((f) => f.estado !== 'cerrado').length;
  const foliosCerrados = folios.filter((f) => f.estado === 'cerrado').length;
  const valorTotal = folios.reduce((sum, f) => sum + (f.precio || 0), 0);
  const costosTotales = folios.reduce(
    (sum, f) => sum + (f.costos || []).reduce((s, c) => s + c.monto, 0),
    0
  );
  const utilidadTotal = Math.max(0, valorTotal - costosTotales);
  const totalActividades = folios.reduce((sum, f) => sum + (f.actividades || []).length, 0);

  // OKRs Variables
  const OKR_CONTACTO_OBJETIVO = 0.90; // 90% of non-closed folios should have at least 1 activity in < 24h
  const foliosParaAcercamiento = folios.filter(f => f.estado !== 'cerrado');
  const foliosAtendidosATiempo = foliosParaAcercamiento.filter(f => {
    if (f.actividades.length === 0) return false;
    const primeraActividad = new Date(f.actividades[f.actividades.length - 1].fecha);
    const creacion = new Date(f.fechaCreacion);
    const diffHoras = (primeraActividad.getTime() - creacion.getTime()) / (1000 * 60 * 60);
    return diffHoras <= 24;
  }).length;
  const progresoContacto = foliosParaAcercamiento.length > 0 
    ? foliosAtendidosATiempo / foliosParaAcercamiento.length 
    : 1;

  const OKR_MARGEN_OBJETIVO = 0.50; // 50% target margin globally
  const margenGlobal = valorTotal > 0 ? (utilidadTotal / valorTotal) : 0;
  const progresoMargen = Math.min(1, margenGlobal / OKR_MARGEN_OBJETIVO);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(val);

  const formatCompact = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface-50">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Dashboard y Reportes</h2>
          <p className="text-sm text-surface-500 mt-1">
            Métricas generales del pipeline inmobiliario (mostrando datos filtrados)
          </p>
        </div>
        <button
          onClick={() => exportarAExcel(folios, 'Reporte_Global_Folios')}
          className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold transition-smooth shadow-sm cursor-pointer flex items-center gap-2 max-w-fit"
        >
          <span className="text-lg">📥</span> Exportar a Excel
        </button>
      </div>

      <div className="mb-8">
        <FiltrosGlobales />
      </div>

      {/* OKRs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 animate-slide-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">⏱️</div>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">OKR 1: Nivel de Servicio (SLA)</p>
          <div className="flex items-end justify-between mb-2">
            <h3 className="text-lg font-bold text-surface-800">Leads Atendidos &lt; 24h</h3>
            <span className={`text-xl font-bold ${progresoContacto >= OKR_CONTACTO_OBJETIVO ? 'text-emerald-500' : 'text-amber-500'}`}>
              {Math.round(progresoContacto * 100)}%
            </span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2 mb-2">
            <div className={`h-2 rounded-full transition-all duration-1000 ${progresoContacto >= OKR_CONTACTO_OBJETIVO ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${progresoContacto * 100}%` }}></div>
          </div>
          <p className="text-xs text-surface-500">Objetivo: {OKR_CONTACTO_OBJETIVO * 100}% | Actual: {foliosAtendidosATiempo} de {foliosParaAcercamiento.length}</p>
        </div>

        {permisos.puedeVerRentabilidad && (
          <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 animate-slide-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💰</div>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1">OKR 2: Rentabilidad</p>
            <div className="flex items-end justify-between mb-2">
              <h3 className="text-lg font-bold text-surface-800">Margen Global vs Meta</h3>
              <span className={`text-xl font-bold ${progresoMargen >= 1 ? 'text-emerald-500' : 'text-red-500'}`}>
                {Math.round(margenGlobal * 100)}%
              </span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-2 mb-2">
              <div className={`h-2 rounded-full transition-all duration-1000 ${progresoMargen >= 1 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${progresoMargen * 100}%` }}></div>
            </div>
            <p className="text-xs text-surface-500">Meta recomendada: {OKR_MARGEN_OBJETIVO * 100}% de Utilidad Neta</p>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KPICard
          title="Total Folios"
          value={totalFolios.toString()}
          icon="📁"
          gradient="from-primary-500 to-primary-600"
          subtitle="Pipeline financiero"
        />
        {permisos.puedeVerRentabilidad && (
          <KPICard
            title="Utilidad Neta"
            value={formatCompact(utilidadTotal)}
            icon="💸"
            gradient="from-emerald-400 to-emerald-600"
            subtitle="Margen global"
          />
        )}
        <KPICard
          title="Activos"
          value={foliosActivos.toString()}
          icon="⚡"
          gradient="from-emerald-500 to-emerald-600"
          subtitle="En proceso"
        />
        <KPICard
          title="Cerrados"
          value={foliosCerrados.toString()}
          icon="✅"
          gradient="from-amber-500 to-amber-600"
          subtitle="Completados"
        />
        <KPICard
          title="Valor Pipeline"
          value={formatCompact(valorTotal)}
          icon="💰"
          gradient="from-purple-500 to-purple-600"
          subtitle="Ingresos proyectados"
        />
        <KPICard
          title="Actividades"
          value={totalActividades.toString()}
          icon="📋"
          gradient="from-sky-500 to-sky-600"
          subtitle="Registradas"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Folios por Etapa */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 animate-slide-in">
          <h3 className="text-lg font-semibold text-surface-800 mb-1">
            Folios por Etapa
          </h3>
          <p className="text-xs text-surface-400 mb-6">
            Distribución del pipeline actual
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPorEtapa} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '13px',
                    padding: '10px 14px',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {dataPorEtapa.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Folios por Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 animate-slide-in">
          <h3 className="text-lg font-semibold text-surface-800 mb-1">
            Distribución por Score
          </h3>
          <p className="text-xs text-surface-400 mb-6">
            Clasificación de oportunidades
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height={permisos.puedeVerRentabilidad ? 400 : 320}>
              <PieChart>
                <Pie
                  data={dataPorScore}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {dataPorScore.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '13px',
                    padding: '10px 14px',
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rentabilidad Components based on role */}
      {permisos.puedeVerRentabilidad && (
        <>
          {/* Profitability Chart */}
          {dataRentabilidad.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 mb-8 animate-slide-in">
              <h3 className="text-lg font-semibold text-surface-800 mb-1">
                Rentabilidad por Folio
              </h3>
              <p className="text-xs text-surface-400 mb-6">
                Ingresos proyectados vs. costos acumulados — Utilidad neta por operación
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataRentabilidad} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => formatCompact(v)} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px', padding: '10px 14px' }}
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'ingreso' ? 'Ingreso' : name === 'costos' ? 'Costos' : 'Utilidad',
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                      formatter={(value: string) => value === 'ingreso' ? 'Ingreso Proyectado' : value === 'costos' ? 'Costos Acumulados' : 'Utilidad Neta'}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Bar dataKey="ingreso" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="costos" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="utilidad" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ========== RENTABILIDAD GENERAL — FASE DE CIERRE ========== */}
          <div className="mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-surface-800">Rentabilidad General</h3>
              <p className="text-xs text-surface-400">
                Margen por operación — Ingresos estimados vs. costos acumulados
              </p>
            </div>

            {/* Margin per folio cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {folios.filter((f) => f.precio && f.precio > 0).map((f) => {
                const tc = (f.costos || []).reduce((s, c) => s + c.monto, 0);
                const margen = (f.precio || 0) - tc;
                const margenPct = f.precio ? (margen / f.precio) * 100 : 0;
                const isCerrado = f.estado === 'cerrado';

                return (
                  <div key={f.id} className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-smooth animate-slide-in ${isCerrado ? 'border-emerald-200' : 'border-surface-200'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-sm">🏠</div>
                        <div>
                          <p className="text-xs font-semibold text-surface-700 truncate max-w-[140px]">{f.tipoInmueble}</p>
                          <p className="text-[10px] text-surface-400 truncate max-w-[140px]">{f.propietario}</p>
                        </div>
                      </div>
                      {isCerrado ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">✅ Cerrado</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">En proceso</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div><p className="text-[9px] text-surface-400 uppercase">Ingreso</p><p className="text-xs font-bold text-surface-700">{formatCompact(f.precio || 0)}</p></div>
                      <div><p className="text-[9px] text-surface-400 uppercase">Costos</p><p className="text-xs font-bold text-red-600">{formatCompact(tc)}</p></div>
                      <div><p className="text-[9px] text-surface-400 uppercase">Margen</p><p className={`text-xs font-bold ${margen >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{margenPct.toFixed(1)}%</p></div>
                    </div>

                    <div className="w-full bg-surface-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all duration-700 ${margen >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.max(margenPct, 0), 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-surface-400">Utilidad: {formatCurrency(margen)}</span>
                      <span className="text-[9px] text-surface-400">Score {f.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cost vs Price comparison chart */}
            {dataRentabilidad.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 animate-slide-in">
                <h4 className="text-sm font-semibold text-surface-800 mb-1">Costo Total vs. Precio Esperado</h4>
                <p className="text-xs text-surface-400 mb-5">Comparativa directa por operación — El delta es tu margen</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataRentabilidad} layout="vertical" barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} width={90} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: 'white', fontSize: '11px', padding: '8px 12px' }}
                        formatter={(value, name) => [formatCurrency(Number(value)), name === 'ingreso' ? 'Precio Esperado' : 'Costo Total']}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} formatter={(value: string) => value === 'ingreso' ? 'Precio Esperado' : 'Costo Total'} />
                      <Bar dataKey="ingreso" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={20} />
                      <Bar dataKey="costos" fill="#ef4444" radius={[0, 6, 6, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Score Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['A', 'B', 'C'] as ScoreFolio[]).map((score) => {
          const config = SCORE_CONFIG[score];
          const count = folios.filter((f) => f.score === score).length;
          const percentage = totalFolios > 0 ? Math.round((count / totalFolios) * 100) : 0;

          return (
            <div
              key={score}
              className="bg-white rounded-2xl shadow-sm border border-surface-200 p-5 animate-slide-in hover:shadow-md transition-smooth"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
                  Score {score}
                </span>
                <span className="text-2xl font-bold text-surface-800">{count}</span>
              </div>
              <div className="w-full bg-surface-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: SCORE_COLORS[score],
                  }}
                ></div>
              </div>
              <p className="text-xs text-surface-400 mt-2">{percentage}% del total</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  icon: string;
  gradient: string;
  subtitle: string;
}

const KPICard: FC<KPICardProps> = ({ title, value, icon, gradient, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-4 hover:shadow-md transition-smooth animate-slide-in">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-xl font-bold text-surface-800 mt-1 truncate">
          {value}
        </p>
        <p className="text-[10px] text-surface-400 mt-0.5">{subtitle}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0 ml-2`}
      >
        <span className="text-lg">{icon}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;

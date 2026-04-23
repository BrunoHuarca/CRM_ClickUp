import { type FC, type FormEvent, useState, useMemo } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import {
  TIPOS_ACTIVIDAD,
  CATEGORIAS_COSTO,
  ACTIVIDAD_ICONS,
  COSTO_ICONS,
  COLUMNAS_KANBAN,
  SCORE_CONFIG,
} from '../constants';
import type { TipoActividad, CategoriaCosto } from '../types';
import { useAlertasFolio } from '../hooks/useAlertasFolio';
import { usePermisos } from '../hooks/usePermisos';

type TabActiva = 'detalle' | 'timeline' | 'costos';

const FolioDetailModal: FC = () => {
  const folioDetalleId = useFolioStore((s) => s.folioDetalleId);
  const folios = useFolioStore((s) => s.folios);
  const cerrarDetalle = useFolioStore((s) => s.cerrarDetalle);
  const agregarActividad = useFolioStore((s) => s.agregarActividad);
  const eliminarActividad = useFolioStore((s) => s.eliminarActividad);
  const agregarCosto = useFolioStore((s) => s.agregarCosto);
  const eliminarCosto = useFolioStore((s) => s.eliminarCosto);

  const [tabActiva, setTabActiva] = useState<TabActiva>('detalle');
  const permisos = usePermisos();

  const folio = useMemo(
    () => folios.find((f) => f.id === folioDetalleId) ?? null,
    [folios, folioDetalleId]
  );

  if (!folio) return null;

  const tabs: { id: TabActiva; label: string; icon: string }[] = [
    { id: 'detalle', label: 'Detalle', icon: '📋' },
    { id: 'timeline', label: 'Bitácora', icon: '🕐' },
    { id: 'costos', label: 'Costos', icon: '💰' },
  ];

  const totalCostos = folio.costos.reduce((sum, c) => sum + c.monto, 0);
  const utilidad = (folio.precio || 0) - totalCostos;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(val);

  const columna = COLUMNAS_KANBAN.find((c) => c.id === folio.estado);
  const scoreConfig = SCORE_CONFIG[folio.score];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          cerrarDetalle();
          setTabActiva('detalle');
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-surface-800 to-surface-900 px-6 py-5 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${scoreConfig.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${scoreConfig.dotColor}`}></span>
                  Score {folio.score}
                </span>
                {columna && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${columna.bgColor} ${columna.color} border ${columna.borderColor}`}>
                    {columna.titulo}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">
                {folio.tipoInmueble} — {folio.propietario}
              </h2>
              <p className="text-surface-400 text-xs mt-1 font-mono">
                ID: {folio.id.slice(0, 12)}... • Creado {new Date(folio.fechaCreacion).toLocaleDateString('es-PE')}
              </p>
            </div>
            <button
              onClick={() => {
                cerrarDetalle();
                setTabActiva('detalle');
              }}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-smooth cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`px-4 py-2 rounded-t-lg text-xs font-semibold transition-smooth cursor-pointer flex items-center gap-1.5 ${
                  tabActiva === tab.id
                    ? 'bg-white text-surface-800 shadow-sm'
                    : 'text-surface-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
                {tab.id === 'timeline' && folio.actividades.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center">
                    {folio.actividades.length}
                  </span>
                )}
                {tab.id === 'costos' && folio.costos.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center">
                    {folio.costos.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {tabActiva === 'detalle' && (
            <DetalleTab
              folio={folio}
              formatCurrency={formatCurrency}
              totalCostos={totalCostos}
              utilidad={utilidad}
            />
          )}
          {tabActiva === 'timeline' && (
            <TimelineTab
              folioId={folio.id}
              actividades={folio.actividades}
              agregarActividad={agregarActividad}
              eliminarActividad={eliminarActividad}
            />
          )}
          {tabActiva === 'costos' && (
            <CostosTab
              folioId={folio.id}
              costos={folio.costos}
              agregarCosto={agregarCosto}
              eliminarCosto={eliminarCosto}
              formatCurrency={formatCurrency}
              totalCostos={totalCostos}
              precioVenta={folio.precio || 0}
              utilidad={utilidad}
              canDeleteCost={permisos.puedeEliminarCosto}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== DETALLE TAB ========== */
interface DetalleTabProps {
  folio: ReturnType<typeof useFolioStore.getState>['folios'][number];
  formatCurrency: (val: number) => string;
  totalCostos: number;
  utilidad: number;
}

const DetalleTab: FC<DetalleTabProps> = ({ folio, formatCurrency, totalCostos, utilidad }) => {
  const alertas = useAlertasFolio(folio);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Alerts section */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                alerta.tipo === 'inactividad'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}
            >
              <span>{alerta.tipo === 'inactividad' ? '⏰' : '⚠️'}</span>
              {alerta.mensaje}
            </div>
          ))}
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <InfoItem label="Tipo de Inmueble" value={folio.tipoInmueble} icon="🏠" />
        <InfoItem label="Propietario" value={folio.propietario} icon="👤" />
        <InfoItem label="Responsable" value={folio.responsable} icon="👔" />
        <InfoItem label="Dirección" value={folio.direccion || 'Sin especificar'} icon="📍" />
      </div>

      {/* Financial Summary */}
      <div className="bg-surface-50 rounded-xl p-5 border border-surface-200">
        <h4 className="text-sm font-semibold text-surface-700 mb-4">Resumen Financiero</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-surface-500 mb-1">Precio Venta</p>
            <p className="text-lg font-bold text-surface-800">
              {folio.precio ? formatCurrency(folio.precio) : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-surface-500 mb-1">Total Costos</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(totalCostos)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-surface-500 mb-1">Utilidad Neta</p>
            <p className={`text-lg font-bold ${utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(utilidad)}
            </p>
          </div>
        </div>
        {folio.precio && folio.precio > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-surface-500 mb-1">
              <span>Margen</span>
              <span>{Math.round((utilidad / folio.precio) * 100)}%</span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${utilidad >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.max(((folio.precio - totalCostos) / folio.precio) * 100, 0), 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
          <div className="flex items-center gap-2 mb-1">
            <span>📋</span>
            <span className="text-xs font-semibold text-primary-700">Actividades</span>
          </div>
          <p className="text-2xl font-bold text-primary-800">{folio.actividades.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <span>💸</span>
            <span className="text-xs font-semibold text-amber-700">Gastos Registrados</span>
          </div>
          <p className="text-2xl font-bold text-amber-800">{folio.costos.length}</p>
        </div>
      </div>
    </div>
  );
};

const InfoItem: FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-white border border-surface-200 rounded-xl p-3">
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-medium text-surface-700 truncate">{value}</p>
  </div>
);

/* ========== TIMELINE TAB ========== */
interface TimelineTabProps {
  folioId: string;
  actividades: ReturnType<typeof useFolioStore.getState>['folios'][number]['actividades'];
  agregarActividad: ReturnType<typeof useFolioStore.getState>['agregarActividad'];
  eliminarActividad: ReturnType<typeof useFolioStore.getState>['eliminarActividad'];
}

const TimelineTab: FC<TimelineTabProps> = ({
  folioId,
  actividades,
  agregarActividad,
  eliminarActividad,
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [tipo, setTipo] = useState<TipoActividad>('Llamada');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [responsable, setResponsable] = useState('');
  const [resultado, setResultado] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!responsable.trim() || !resultado.trim()) return;

    agregarActividad(folioId, {
      tipo,
      fecha: new Date(fecha).toISOString(),
      responsable: responsable.trim(),
      resultado: resultado.trim(),
    });

    setFormVisible(false);
    setResponsable('');
    setResultado('');
    setTipo('Llamada');
    setFecha(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Add button */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold text-surface-700">Bitácora de Actividades</h4>
          <p className="text-xs text-surface-400">{actividades.length} actividades registradas</p>
        </div>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth cursor-pointer flex items-center gap-1"
        >
          {formVisible ? '✕ Cancelar' : '+ Registrar'}
        </button>
      </div>

      {/* Form */}
      {formVisible && (
        <form onSubmit={handleSubmit} className="bg-surface-50 rounded-xl p-4 mb-5 border border-surface-200 space-y-3 animate-scale-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoActividad)}
                className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {TIPOS_ACTIVIDAD.map((t) => (
                  <option key={t} value={t}>{ACTIVIDAD_ICONS[t]} {t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
              Responsable *
            </label>
            <input
              type="text"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              placeholder="Nombre del responsable"
              required
              className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
              Resultado *
            </label>
            <textarea
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              placeholder="Describe el resultado de la actividad..."
              required
              rows={2}
              className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-xs font-semibold transition-smooth cursor-pointer"
          >
            Guardar Actividad
          </button>
        </form>
      )}

      {/* Timeline */}
      {actividades.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block opacity-40">🕐</span>
          <p className="text-sm text-surface-400">No hay actividades registradas</p>
          <p className="text-xs text-surface-300 mt-1">Haz clic en "Registrar" para agregar la primera</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-200"></div>

          <div className="space-y-4">
            {actividades.map((actividad) => (
              <div key={actividad.id} className="relative pl-10 group">
                {/* Timeline dot */}
                <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow-sm z-10"></div>

                <div className="bg-white border border-surface-200 rounded-xl p-4 hover:shadow-sm transition-smooth">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ACTIVIDAD_ICONS[actividad.tipo] || '📌'}</span>
                      <span className="text-xs font-semibold text-surface-700">{actividad.tipo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-surface-400">
                        {new Date(actividad.fecha).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => eliminarActividad(folioId, actividad.id)}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 text-[10px] transition-smooth cursor-pointer"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white text-[7px] font-bold">{actividad.responsable.charAt(0)}</span>
                    </div>
                    <span className="text-[10px] text-surface-500 font-medium">{actividad.responsable}</span>
                  </div>
                  <p className="text-xs text-surface-600 leading-relaxed">{actividad.resultado}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ========== COSTOS TAB ========== */
interface CostosTabProps {
  folioId: string;
  costos: ReturnType<typeof useFolioStore.getState>['folios'][number]['costos'];
  agregarCosto: ReturnType<typeof useFolioStore.getState>['agregarCosto'];
  eliminarCosto: ReturnType<typeof useFolioStore.getState>['eliminarCosto'];
  formatCurrency: (val: number) => string;
  totalCostos: number;
  precioVenta: number;
  utilidad: number;
  canDeleteCost: boolean;
}

const CostosTab: FC<CostosTabProps> = ({
  folioId,
  costos,
  agregarCosto,
  eliminarCosto,
  formatCurrency,
  totalCostos,
  precioVenta,
  utilidad,
  canDeleteCost,
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [categoria, setCategoria] = useState<CategoriaCosto>('Gasolina');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !monto) return;

    agregarCosto(folioId, {
      categoria,
      descripcion: descripcion.trim(),
      monto: Number(monto),
      fecha: new Date(fecha).toISOString(),
    });

    setFormVisible(false);
    setDescripcion('');
    setMonto('');
    setCategoria('Gasolina');
    setFecha(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 text-center">
          <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Ingreso</p>
          <p className="text-sm font-bold text-surface-800">
            {precioVenta > 0 ? formatCurrency(precioVenta) : '—'}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-center">
          <p className="text-[10px] text-red-500 uppercase font-semibold mb-1">Costos</p>
          <p className="text-sm font-bold text-red-700">{formatCurrency(totalCostos)}</p>
        </div>
        <div className={`rounded-xl p-3 border text-center ${utilidad >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-[10px] uppercase font-semibold mb-1 ${utilidad >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            Utilidad
          </p>
          <p className={`text-sm font-bold ${utilidad >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(utilidad)}
          </p>
        </div>
      </div>

      {/* Add button */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold text-surface-700">Registro de Costos</h4>
          <p className="text-xs text-surface-400">{costos.length} gastos registrados</p>
        </div>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth cursor-pointer flex items-center gap-1"
        >
          {formVisible ? '✕ Cancelar' : '+ Agregar Gasto'}
        </button>
      </div>

      {/* Form */}
      {formVisible && (
        <form onSubmit={handleSubmit} className="bg-surface-50 rounded-xl p-4 mb-5 border border-surface-200 space-y-3 animate-scale-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaCosto)}
                className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {CATEGORIAS_COSTO.map((c) => (
                  <option key={c} value={c}>{COSTO_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                Monto (PEN) *
              </label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                min="0"
                required
                className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
              Descripción *
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el gasto..."
              required
              className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-xs font-semibold transition-smooth cursor-pointer"
          >
            Guardar Gasto
          </button>
        </form>
      )}

      {/* Costs List */}
      {costos.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block opacity-40">💸</span>
          <p className="text-sm text-surface-400">No hay costos registrados</p>
          <p className="text-xs text-surface-300 mt-1">Haz clic en "Agregar Gasto" para registrar uno</p>
        </div>
      ) : (
        <div className="space-y-2">
          {costos.map((costo) => (
            <div
              key={costo.id}
              className="bg-white border border-surface-200 rounded-xl p-3 flex items-center justify-between hover:shadow-sm transition-smooth group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
                  <span className="text-lg">{COSTO_ICONS[costo.categoria] || '📎'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-surface-700">{costo.categoria}</span>
                    <span className="text-[10px] text-surface-400">
                      {new Date(costo.fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-500 truncate">{costo.descripcion}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-red-600">{formatCurrency(costo.monto)}</span>
                {canDeleteCost && (
                  <button
                    onClick={() => eliminarCosto(folioId, costo.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 text-xs transition-smooth cursor-pointer"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolioDetailModal;

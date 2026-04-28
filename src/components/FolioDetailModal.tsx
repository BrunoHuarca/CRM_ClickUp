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
import { usePermisos, useUsuarioActual } from '../hooks/usePermisos';
import { useUsuarioStore } from '../store/useUsuarioStore';

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
  const utilidad = (folio.precioEsperado || 0) - totalCostos;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
                {folio.tipoInmueble} — {folio.propietarioNombre}
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
              precioVenta={folio.precioEsperado || 0}
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
  return <DetalleTabContent folio={folio} formatCurrency={formatCurrency} totalCostos={totalCostos} utilidad={utilidad} alertas={alertas} />;
};

const DetalleTabContent: FC<DetalleTabProps & { alertas: any[] }> = ({ folio, formatCurrency, totalCostos, utilidad, alertas }) => {
  const actualizarFolio = useFolioStore((s) => s.actualizarFolio);
  const moverFolio = useFolioStore((s) => s.moverFolio);
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActual = useUsuarioActual();

  const [comercialId, setComercialId] = useState('');
  const [fechaVisita, setFechaVisita] = useState(folio.visitaProgramada || '');
  const [procesando, setProcesando] = useState(false);

  const agentesComerciales = usuarios.filter((u) => u.rol === 'Comercial' && u.activo);
  
  const handleAvanzarComercial = async () => {
    if (!comercialId || !fechaVisita) {
      alert('Para pasar a Comercial, debes asignar un comercial y programar una visita.');
      return;
    }

    setProcesando(true);
    const selected = usuarios.find(u => u.id === comercialId);
    
    actualizarFolio(folio.id, {
      responsablePrincipal: selected?.nombre || '',
      visitaProgramada: fechaVisita
    });
    
    moverFolio(folio.id, 'Comercial');
    setProcesando(false);
  };

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

      {/* Responsables */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
          <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Registrado por</p>
          <p className="text-sm font-bold text-surface-800">{folio.responsable}</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
          <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Comercial Asignado</p>
          <p className="text-sm font-bold text-[#047D7D]">{folio.responsablePrincipal || 'Sin asignar'}</p>
        </div>
      </div>

      {/* Formulario de Transición - Call Center -> Comercial */}
      {(usuarioActual?.rol === 'Call Center' || usuarioActual?.rol === 'Admin') && folio.estado === 'Captación' && (
        <div className="bg-[#047D7D]/5 rounded-2xl p-5 border border-[#047D7D]/20 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎯</span>
            <h4 className="text-sm font-bold text-[#047D7D] uppercase tracking-wider">Acciones de Captación</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Asignar Comercial *</label>
              <select
                value={comercialId}
                onChange={(e) => setComercialId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-surface-200 rounded-xl text-xs focus:outline-none focus:border-[#047D7D] transition-smooth"
              >
                <option value="">Seleccionar...</option>
                {agentesComerciales.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Programar Visita *</label>
              <input
                type="datetime-local"
                value={fechaVisita}
                onChange={(e) => setFechaVisita(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-surface-200 rounded-xl text-xs focus:outline-none focus:border-[#047D7D] transition-smooth"
              />
            </div>
          </div>

          <button
            onClick={handleAvanzarComercial}
            disabled={procesando || !comercialId || !fechaVisita}
            className="w-full bg-[#047D7D] hover:bg-[#036666] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-bold transition-smooth shadow-lg shadow-[#047D7D]/20 flex items-center justify-center gap-2"
          >
            {procesando ? 'Procesando...' : 'Pasar a Etapa Comercial 🚀'}
          </button>
        </div>
      )}

      {/* Mostrar Visita Programada si existe */}
      {folio.visitaProgramada && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Visita Programada</p>
              <p className="text-sm font-bold text-amber-900">
                {new Date(folio.visitaProgramada).toLocaleString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Transición - Comercial -> Legal */}
      {(usuarioActual?.rol === 'Comercial' || usuarioActual?.rol === 'Admin') && folio.estado === 'Comercial' && (
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤝</span>
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Acciones Comerciales</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Tasación (USD) *</label>
              <input
                type="number"
                defaultValue={folio.tasacion}
                onBlur={(e) => actualizarFolio(folio.id, { tasacion: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-surface-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-smooth"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Calificación (Score) *</label>
              <div className="flex gap-1">
                {(['A', 'B', 'C'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => actualizarFolio(folio.id, { score: s })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                      folio.score === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-surface-600 border border-surface-200 hover:bg-blue-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Multimedia (Fotos/Videos) *</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {folio.multimediaUrls?.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-surface-200 group">
                  {url.startsWith('data:video') ? (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xl">🎥</div>
                  ) : (
                    <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => {
                      const newUrls = folio.multimediaUrls?.filter((_, idx) => idx !== i);
                      actualizarFolio(folio.id, { multimediaUrls: newUrls });
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-smooth"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-surface-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-smooth">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        const currentUrls = useFolioStore.getState().folios.find(f => f.id === folio.id)?.multimediaUrls || [];
                        actualizarFolio(folio.id, { multimediaUrls: [...currentUrls, base64] });
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="hidden"
                />
                <span className="text-xl">➕</span>
                <span className="text-[10px] font-bold text-surface-400">Añadir</span>
              </label>
            </div>
            <p className="text-[9px] text-surface-400 italic">Puedes subir múltiples archivos de imagen o video.</p>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-surface-200">
            <span className="text-xs font-bold text-surface-700">Negociación Aceptada por el Propietario?</span>
            <button
              onClick={() => actualizarFolio(folio.id, { negociacionAceptada: !folio.negociacionAceptada })}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-smooth ${
                folio.negociacionAceptada
                  ? 'bg-emerald-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {folio.negociacionAceptada ? 'Aceptada ✅' : 'No Aceptada ❌'}
            </button>
          </div>

          <button
            onClick={() => {
              if (folio.negociacionAceptada) {
                if (!folio.tasacion || !folio.multimediaUrls?.length) {
                  alert('Debes completar la tasación y cargar multimedia para pasar a Legal.');
                  return;
                }
                moverFolio(folio.id, 'Legal');
              } else {
                if (confirm('¿Estás seguro de que deseas cancelar este folio? Esta acción lo moverá al estado de Cancelado.')) {
                  moverFolio(folio.id, 'Cancelado');
                }
              }
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-smooth shadow-lg flex items-center justify-center gap-2 ${
              folio.negociacionAceptada
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                : 'bg-slate-600 hover:bg-slate-700 text-white shadow-slate-500/20'
            }`}
          >
            {folio.negociacionAceptada ? (
              <>Pasar a Etapa Legal ⚖️</>
            ) : (
              <>Mover a Cancelados 🚫</>
            )}
          </button>
        </div>
      )}

      {/* Mostrar Tasación si existe */}
      {folio.tasacion && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <div>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Tasación Oficial</p>
              <p className="text-sm font-bold text-blue-900">{formatCurrency(folio.tasacion)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar Multimedia si existe */}
      {folio.multimediaUrls && folio.multimediaUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider px-1">Material Multimedia</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {folio.multimediaUrls.map((url, i) => {
              const isVideo = url.startsWith('data:video');
              return (
                <div key={i} className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-xl bg-surface-100 border border-surface-200 overflow-hidden flex items-center justify-center shadow-sm">
                    {isVideo ? (
                      <div className="flex flex-col items-center gap-1 text-surface-400">
                        <span className="text-3xl">🎥</span>
                        <span className="text-[8px] font-bold uppercase">Video</span>
                      </div>
                    ) : (
                      <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      const win = window.open();
                      win?.document.write(`
                        <html>
                          <body style="margin:0; background: #000; display:flex; align-items:center; justify-center; height:100vh;">
                            ${isVideo ? 
                              `<video src="${url}" controls style="max-width:100%; max-height:100%;"></video>` : 
                              `<img src="${url}" style="max-width:100%; max-height:100%; object-fit:contain;" />`
                            }
                          </body>
                        </html>
                      `);
                    }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center rounded-xl"
                  >
                    <span className="text-white text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/30">Ampliar 🔍</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario de Transición - Legal -> Firma */}
      {(usuarioActual?.rol === 'Legal' || usuarioActual?.rol === 'Admin') && folio.estado === 'Legal' && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚖️</span>
            <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider">Acciones Legales</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Estudio de Títulos *</label>
              <div className="flex gap-1">
                {(['Apto', 'Regularizar'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => actualizarFolio(folio.id, { estudioTitulos: opt })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                      folio.estudioTitulos === opt
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-surface-600 border border-surface-200 hover:bg-amber-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">¿Requiere Saneamiento? *</label>
              <div className="flex gap-1">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => actualizarFolio(folio.id, { requiereSaneamiento: val })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                      folio.requiereSaneamiento === val
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-surface-600 border border-surface-200 hover:bg-amber-50'
                    }`}
                  >
                    {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Subir Contrato de Exclusividad (PDF) *</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      alert('Por favor, sube solo archivos PDF.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      actualizarFolio(folio.id, { contratoExclusividadUrl: base64 });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="upload-exclusividad"
              />
              <label
                htmlFor="upload-exclusividad"
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-smooth ${
                  folio.contratoExclusividadUrl
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-surface-200 text-surface-500 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                {folio.contratoExclusividadUrl ? (
                  <>
                    <span className="text-lg">📄</span>
                    <span className="text-xs font-bold truncate max-w-[200px]">
                      Exclusividad.pdf
                    </span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        actualizarFolio(folio.id, { contratoExclusividadUrl: undefined });
                      }}
                      className="ml-2 p-1 hover:bg-amber-200 rounded-full transition-smooth"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-lg">📤</span>
                    <span className="text-xs font-bold">Seleccionar archivo PDF</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button
            onClick={() => {
              if (!folio.estudioTitulos || !folio.contratoExclusividadUrl || folio.requiereSaneamiento === undefined) {
                alert('Debes completar el estudio de títulos, el contrato de exclusividad y el saneamiento.');
                return;
              }
              moverFolio(folio.id, 'Firma');
            }}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-bold transition-smooth shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            Pasar a Etapa de Firma 🖋️
          </button>
        </div>
      )}

      {/* Mostrar Datos Legales si existen */}
      {(folio.estudioTitulos || folio.contratoExclusividadUrl) && (
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 space-y-3">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Estado Legal</p>
          <div className="flex flex-wrap gap-3">
            {folio.estudioTitulos && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                <span className="text-[10px] font-semibold text-surface-500">Títulos:</span>
                <span className={`text-[10px] font-bold ${folio.estudioTitulos === 'Apto' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {folio.estudioTitulos}
                </span>
              </div>
            )}
            {folio.requiereSaneamiento !== undefined && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                <span className="text-[10px] font-semibold text-surface-500">Saneamiento:</span>
                <span className="text-[10px] font-bold text-surface-700">
                  {folio.requiereSaneamiento ? 'Requerido' : 'No Requerido'}
                </span>
              </div>
            )}
            {folio.contratoExclusividadUrl && (
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = folio.contratoExclusividadUrl!;
                  link.download = 'Contrato_Exclusividad.pdf';
                  link.click();
                }}
                className="flex items-center gap-1.5 bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition-smooth shadow-sm"
              >
                <span className="text-[10px] font-bold italic">📄 Descargar Exclusividad</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulario de Transición - Firma -> Gerencia */}
      {(usuarioActual?.rol === 'Comercial' || usuarioActual?.rol === 'Admin') && folio.estado === 'Firma' && (
        <div className="bg-cyan-50 rounded-2xl p-5 border border-cyan-200 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🖋️</span>
            <h4 className="text-sm font-bold text-cyan-700 uppercase tracking-wider">Formalización de Contrato</h4>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1.5">Subir Contrato Firmado (PDF) *</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      alert('Por favor, sube solo archivos PDF.');
                      return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      // Guardamos el nombre del archivo metadato + base64
                      actualizarFolio(folio.id, { contratoFirmadoUrl: base64 });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="upload-contrato"
              />
              <label
                htmlFor="upload-contrato"
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-smooth ${
                  folio.contratoFirmadoUrl
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-surface-200 text-surface-500 hover:border-cyan-400 hover:bg-cyan-50'
                }`}
              >
                {folio.contratoFirmadoUrl ? (
                  <>
                    <span className="text-lg">📄</span>
                    <span className="text-xs font-bold truncate max-w-[200px]">
                      Contrato_Firmado.pdf
                    </span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        actualizarFolio(folio.id, { contratoFirmadoUrl: undefined });
                      }}
                      className="ml-2 p-1 hover:bg-emerald-200 rounded-full transition-smooth"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-lg">📤</span>
                    <span className="text-xs font-bold">Seleccionar archivo PDF</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button
            onClick={() => {
              if (!folio.contratoFirmadoUrl) {
                alert('Debes adjuntar el contrato firmado para proceder.');
                return;
              }
              moverFolio(folio.id, 'Gerencia');
            }}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-xl text-xs font-bold transition-smooth shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            Enviar a Aprobación de Gerencia 🚀
          </button>
        </div>
      )}

      {/* Mostrar Contrato Firmado si existe */}
      {folio.contratoFirmadoUrl && (
        <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">✍️</span>
            <div>
              <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">Documento de Cierre</p>
              <p className="text-xs font-bold text-cyan-900">Contrato Firmado Registrado</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = folio.contratoFirmadoUrl!;
              link.target = '_blank';
              link.download = 'Contrato_Firmado.pdf';
              link.click();
            }}
            className="bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-cyan-700 transition-smooth"
          >
            Ver / Descargar PDF
          </button>
        </div>
      )}

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Datos del Inmueble */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-surface-700 flex items-center gap-2">
            <span>🏠</span> Datos del Inmueble
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Tipo" value={folio.tipoInmueble} />
            <InfoItem label="Metraje" value={`${folio.metraje || 0} m²`} />
            <InfoItem label="Antigüedad" value={folio.antiguedad !== undefined ? `${folio.antiguedad} años` : '—'} />
            <InfoItem label="Partida Reg." value={folio.partidaRegistral || '—'} />
            <InfoItem label="Ubicación" value={[folio.distrito, folio.provincia].filter(Boolean).join(', ') || '—'} />
            <InfoItem label="Urgencia Venta" value={folio.urgenciaVenta || '—'} />
          </div>
        </div>

        {/* Datos del Propietario */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-surface-700 flex items-center gap-2">
            <span>👤</span> Datos del Propietario
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Nombre" value={folio.propietarioNombre || '—'} />
            <InfoItem label="DNI / RUC" value={folio.propietarioDni || '—'} />
            <InfoItem label="Teléfono" value={folio.propietarioTelefono || '—'} />
            <InfoItem label="Email" value={folio.propietarioEmail || '—'} />
            <InfoItem label="Cant. Propietarios" value={String(folio.cantidadPropietarios || 1)} />
            <InfoItem label="Origen" value={folio.origen || '—'} />
            <InfoItem label="Disposición" value={folio.nivelDisposicion || '—'} />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-surface-50 rounded-xl p-5 border border-surface-200">
        <h4 className="text-sm font-semibold text-surface-700 mb-4">Resumen Financiero</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-surface-500 mb-1">Precio Esperado</p>
            <p className="text-lg font-bold text-surface-800">
              {folio.precioEsperado ? formatCurrency(folio.precioEsperado) : '—'}
            </p>
            {folio.precioSugerido && folio.precioSugerido > 0 && (
              <p className="text-[10px] text-surface-400 mt-1">
                Sug: {formatCurrency(folio.precioSugerido)}
              </p>
            )}
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
        {folio.precioEsperado && folio.precioEsperado > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-surface-500 mb-1">
              <span>Margen</span>
              <span>{Math.round((utilidad / folio.precioEsperado) * 100)}%</span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${utilidad >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(Math.max(((folio.precioEsperado - totalCostos) / folio.precioEsperado) * 100, 0), 100)}%` }}
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

const InfoItem: FC<{ label: string; value: string; icon?: string }> = ({ label, value, icon }) => (
  <div className="bg-white border border-surface-200 rounded-xl p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-medium text-surface-700 truncate" title={value}>{value}</p>
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
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [responsable, setResponsable] = useState('');
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!responsable.trim() || !resultado.trim()) return;
    setError('');

    if (tipo === 'Visita') {
      if (!horaInicio || !horaFin) {
        setError('Debes ingresar hora de inicio y fin para la visita');
        return;
      }
      if (horaInicio >= horaFin) {
        setError('La hora de inicio debe ser menor a la hora de fin');
        return;
      }

      // Validación de Cruce
      const allFolios = useFolioStore.getState().folios;
      const tFecha = new Date(fecha).toISOString().split('T')[0];
      
      const hasOverlap = allFolios.some(f => 
        f.actividades.some(a => 
          a.tipo === 'Visita' &&
          a.responsable === responsable.trim() &&
          a.fecha.split('T')[0] === tFecha &&
          a.horaInicio && a.horaFin &&
          !(horaFin <= a.horaInicio || horaInicio >= a.horaFin)
        )
      );

      if (hasOverlap) {
        setError('Conflicto de horario: El agente ya tiene una actividad programada en ese rango');
        return;
      }
    }

    agregarActividad(folioId, {
      tipo,
      fecha: new Date(fecha).toISOString(),
      horaInicio: tipo === 'Visita' ? horaInicio : undefined,
      horaFin: tipo === 'Visita' ? horaFin : undefined,
      responsable: responsable.trim(),
      resultado: resultado.trim(),
    });

    setFormVisible(false);
    setResponsable('');
    setResultado('');
    setTipo('Llamada');
    setFecha(new Date().toISOString().split('T')[0]);
    setHoraInicio('');
    setHoraFin('');
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
                onChange={(e) => {
                  setTipo(e.target.value as TipoActividad);
                  setError('');
                }}
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
          {tipo === 'Visita' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                  Hora de inicio *
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                  className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                  Hora de fin *
                </label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  required
                  className="w-full px-2.5 py-2 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
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
          {error && (
            <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center animate-shake">
              {error}
            </div>
          )}
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
                        {actividad.horaInicio && actividad.horaFin && (
                          <span className="ml-1.5 font-medium bg-surface-100 px-1.5 py-0.5 rounded border border-surface-200">
                            {actividad.horaInicio} - {actividad.horaFin}
                          </span>
                        )}
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

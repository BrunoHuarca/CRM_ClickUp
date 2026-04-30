import { type FC, useState, useMemo, useRef } from 'react';
import { useCompradorStore } from '../store/useCompradorStore';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { COLUMNAS_KANBAN_COMPRADOR } from '../constants/compradores';
import { SCORE_CONFIG } from '../constants';
import { useUsuarioActual } from '../hooks/usePermisos';

type TabActiva = 'detalle' | 'timeline';

const CompradorDetailModal: FC = () => {
  const compradorDetalleId = useCompradorStore((s) => s.compradorDetalleId);
  const isReadOnly = useCompradorStore((s) => s.isReadOnly);
  const compradores = useCompradorStore((s) => s.compradores);
  const cerrarDetalle = useCompradorStore((s) => s.cerrarDetalle);
  const agregarActividad = useCompradorStore((s) => s.agregarActividad);
  const eliminarActividad = useCompradorStore((s) => s.eliminarActividad);

  const [tabActiva, setTabActiva] = useState<TabActiva>('detalle');

  const comprador = useMemo(
    () => compradores.find((c) => c.id === compradorDetalleId) ?? null,
    [compradores, compradorDetalleId]
  );

  if (!comprador) return null;

  const tabs: { id: TabActiva; label: string; icon: string }[] = [
    { id: 'detalle', label: 'Detalle', icon: '📋' },
    { id: 'timeline', label: 'Bitácora', icon: '🕐' },
  ];

  const columna = COLUMNAS_KANBAN_COMPRADOR.find((c) => c.id === comprador.estado);
  const scoreConfig = SCORE_CONFIG[comprador.score];

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
                  Score {comprador.score}
                </span>
                {columna && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${columna.bgColor} ${columna.color} border ${columna.borderColor}`}>
                    {columna.titulo}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">
                {comprador.nombre}
              </h2>
              <p className="text-surface-400 text-xs mt-1 font-mono">
                ID: {comprador.id.slice(0, 12)} • Registrado {new Date(comprador.fechaCreacion).toLocaleDateString('es-PE')}
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
                {tab.id === 'timeline' && comprador.actividades.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] flex items-center justify-center">
                    {comprador.actividades.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {tabActiva === 'detalle' && (
            <DetalleTab comprador={comprador} isReadOnly={isReadOnly} />
          )}
          {tabActiva === 'timeline' && (
            <TimelineTab
              comprador={comprador}
              agregarActividad={agregarActividad}
              eliminarActividad={eliminarActividad}
              isReadOnly={isReadOnly}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const DetalleTab: FC<{ comprador: any; isReadOnly: boolean }> = ({ comprador, isReadOnly }) => {
  const moverComprador = useCompradorStore((s) => s.moverComprador);
  const actualizarComprador = useCompradorStore((s) => s.actualizarComprador);
  const cerrarDetalle = useCompradorStore((s) => s.cerrarDetalle);
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const folios = useFolioStore((s) => s.folios);
  const actualizarFolio = useFolioStore((s) => s.actualizarFolio);
  const usuarioActual = useUsuarioActual();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const firmaInputRef = useRef<HTMLInputElement>(null);

  const [comercialId, setComercialId] = useState('');
  const [interesado, setInteresado] = useState<boolean | null>(null);
  const [folioId, setFolioId] = useState('');
  const [datosLegales, setDatosLegales] = useState(comprador.datosLegales || '');
  const [contratoUrl, setContratoUrl] = useState(comprador.contratoUrl || '');
  const [contratoFirmadoUrl, setContratoFirmadoUrl] = useState(comprador.contratoFirmadoUrl || '');
  const [subiendo, setSubiendo] = useState(false);

  const handleMoverAComercial = () => {
    if (!comercialId) return;
    const user = usuarios.find(u => u.id === comercialId);
    actualizarComprador(comprador.id, { responsable: user?.nombre || 'Sin asignar' });
    moverComprador(comprador.id, 'Comercial');
    cerrarDetalle();
  };

  const handleComercialTransition = () => {
    if (interesado === false) {
      moverComprador(comprador.id, 'Perdido');
      cerrarDetalle();
    } else if (interesado === true && folioId) {
      // Bloqueamos la propiedad para este comprador
      actualizarFolio(folioId, { compradorAsignadoId: comprador.id });
      
      actualizarComprador(comprador.id, { interesado: true, folioVinculadoId: folioId });
      moverComprador(comprador.id, 'Legal');
      cerrarDetalle();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'contrato' | 'firma') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      return;
    }

    setSubiendo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'contrato') setContratoUrl(base64);
      else setContratoFirmadoUrl(base64);
      setSubiendo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLegalTransition = () => {
    if (!datosLegales || !contratoUrl) return;
    actualizarComprador(comprador.id, { datosLegales, contratoUrl });
    moverComprador(comprador.id, 'Firma');
    cerrarDetalle();
  };

  const handleFirmaTransition = () => {
    if (!contratoFirmadoUrl) return;
    actualizarComprador(comprador.id, { contratoFirmadoUrl, fechaCierre: new Date().toISOString() });
    
    // Si hay una propiedad vinculada, la marcamos como Vendida
    if (comprador.folioVinculadoId) {
      actualizarFolio(comprador.folioVinculadoId, { 
        estado: 'Vendido',
        fechaCierre: new Date().toISOString(),
        compradorAsignadoId: comprador.id // Aseguramos que se mantenga el vínculo
      });
    }

    moverComprador(comprador.id, 'Cierre');
    cerrarDetalle();
  };

  const handleDescartarOperacion = () => {
    if (!confirm('¿Estás seguro de descartar esta operación? La propiedad vinculada quedará libre.')) return;
    
    // Liberar propiedad
    if (comprador.folioVinculadoId) {
      actualizarFolio(comprador.folioVinculadoId, { compradorAsignadoId: undefined });
    }

    moverComprador(comprador.id, 'Perdido');
    cerrarDetalle();
  };

  const verDocumento = (url: string) => {
    if (!url) return;
    const win = window.open();
    win?.document.write(`
      <html>
        <body style="margin:0; background: #525659; display:flex; align-items:center; justify-center; height:100vh;">
          <embed src="${url}" type="application/pdf" style="width:100%; height:100%; border:none;" />
        </body>
      </html>
    `);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Responsables */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
          <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Responsable</p>
          <p className="text-sm font-bold text-[#047D7D]">{comprador.responsable}</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
          <p className="text-[10px] text-surface-500 uppercase font-semibold mb-1">Contacto</p>
          <p className="text-sm font-bold text-surface-800">{comprador.telefono || comprador.email || 'Sin contacto'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-4 space-y-4 shadow-sm">
        <h4 className="text-xs font-bold text-surface-700 uppercase">Información del Cliente</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-[10px] text-surface-500 font-semibold mb-0.5">Inversión Estimada</span>
            <span className="font-medium text-emerald-600">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(comprador.inversionEstimada)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-surface-500 font-semibold mb-0.5">Tipo que Busca</span>
            <span className="font-medium">{comprador.tipoInmuebleBusca}</span>
          </div>
          <div>
            <span className="block text-[10px] text-surface-500 font-semibold mb-0.5">Urgencia</span>
            <span className="font-medium">{comprador.urgencia}</span>
          </div>
          <div>
            <span className="block text-[10px] text-surface-500 font-semibold mb-0.5">Origen</span>
            <span className="font-medium">{comprador.origen}</span>
          </div>
        </div>
        
        {comprador.folioVinculadoId && (
          <div className="pt-4 border-t border-surface-100">
            <span className="block text-[10px] text-surface-500 font-semibold mb-1 uppercase tracking-wider">Propiedad Reservada</span>
            <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
              <span className="text-lg">🔒</span>
              <span className="text-xs font-bold text-emerald-800">{comprador.folioVinculadoId}</span>
            </div>
          </div>
        )}

        {(comprador.contratoUrl || comprador.contratoFirmadoUrl) && (
          <div className="pt-4 border-t border-surface-100">
            <span className="block text-[10px] text-surface-500 font-semibold mb-2 uppercase tracking-wider">Documentación Legal</span>
            <div className="grid grid-cols-2 gap-3">
              {comprador.contratoUrl && (
                <button 
                  onClick={() => verDocumento(comprador.contratoUrl)}
                  className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-left hover:bg-blue-100 transition-smooth group"
                >
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="text-[10px] font-bold text-blue-800">Proyecto Contrato</p>
                    <p className="text-[9px] text-blue-600 group-hover:underline">Ver archivo PDF</p>
                  </div>
                </button>
              )}
              {comprador.contratoFirmadoUrl && (
                <button 
                  onClick={() => verDocumento(comprador.contratoFirmadoUrl)}
                  className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-100 rounded-lg text-left hover:bg-purple-100 transition-smooth group"
                >
                  <span className="text-lg">🖋️</span>
                  <div>
                    <p className="text-[10px] font-bold text-purple-800">Contrato Firmado</p>
                    <p className="text-[9px] text-purple-600 group-hover:underline">Ver archivo PDF</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {comprador.notas && (
          <div className="mt-4">
            <span className="block text-[10px] text-surface-500 font-semibold mb-0.5">Notas</span>
            <p className="text-sm text-surface-700 whitespace-pre-wrap">{comprador.notas}</p>
          </div>
        )}

        {/* Propiedades de Interés */}
        <div className="mt-6 pt-4 border-t border-surface-100">
          <h4 className="text-[10px] font-bold text-surface-500 uppercase mb-3 tracking-wider">Historial de Interés</h4>
          {(() => {
            const desvincularPropiedad = useCompradorStore.getState().desvincularPropiedad;
            const propiedadesVinculadas = folios.filter(f => comprador.propiedadesInteres?.includes(f.id));

            if (propiedadesVinculadas.length === 0) {
              return <p className="text-xs text-surface-400 italic">No hay propiedades vinculadas aún.</p>;
            }

            return (
              <div className="space-y-2">
                {propiedadesVinculadas.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg border border-surface-200 group">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏠</span>
                      <div>
                        <p className="text-xs font-bold text-surface-800">{p.tipoInmueble} - {p.propietarioNombre}</p>
                        <p className="text-[10px] text-surface-500">{p.id} • {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p.precioEsperado || 0)}</p>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <button 
                        onClick={() => desvincularPropiedad(comprador.id, p.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-smooth opacity-0 group-hover:opacity-100"
                        title="Quitar de interés"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* FLUJO DE ESTADOS */}
      {!isReadOnly && (
        <div className="bg-surface-50 rounded-xl p-5 border border-surface-200 space-y-4 shadow-inner">
          <h4 className="text-xs font-bold text-surface-800 uppercase tracking-widest border-b border-surface-200 pb-2 flex items-center gap-2">
            <span className="text-lg">⚙️</span> Gestión de Proceso
          </h4>

          {/* CAPTACION -> COMERCIAL */}
          {comprador.estado === 'Captación' && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-surface-600 font-medium italic">Asigna un comercial para iniciar el proceso de venta.</p>
              <div className="flex gap-2">
                <select 
                  value={comercialId}
                  onChange={(e) => setComercialId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm"
                  disabled={usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Call Center'}
                >
                  <option value="">Seleccionar Comercial...</option>
                  {usuarios.filter(u => u.rol === 'Comercial' && u.activo).map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
                <button 
                  onClick={handleMoverAComercial}
                  disabled={!comercialId || (usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Call Center')}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-smooth shadow-lg shadow-emerald-600/20"
                >
                  Pasar a Comercial
                </button>
              </div>
            </div>
          )}

          {/* COMERCIAL -> LEGAL */}
          {comprador.estado === 'Comercial' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-surface-700 font-semibold uppercase">¿El cliente está interesado?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setInteresado(true)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-smooth ${interesado === true ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-inner' : 'bg-white border-surface-200 text-surface-500 hover:bg-surface-50'}`}
                  disabled={usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Comercial'}
                >
                  SÍ, tiene interés
                </button>
                <button 
                  onClick={() => setInteresado(false)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-smooth ${interesado === false ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-inner' : 'bg-white border-surface-200 text-surface-500 hover:bg-surface-50'}`}
                  disabled={usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Comercial'}
                >
                  NO tiene interés
                </button>
              </div>

              {interesado === true && (
                <div className="pt-2 animate-slide-up">
                  <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1">Propiedad Seleccionada (Disponibles)</label>
                  <select 
                    value={folioId}
                    onChange={(e) => setFolioId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm mb-3"
                  >
                    <option value="">Seleccionar Propiedad...</option>
                    {folios.filter(f => f.estado === 'Publicado' && (!f.compradorAsignadoId || f.compradorAsignadoId === comprador.id)).map(f => (
                      <option key={f.id} value={f.id}>{f.id} - {f.propietarioNombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                onClick={handleComercialTransition}
                disabled={interesado === null || (interesado === true && !folioId) || (usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Comercial')}
                className="w-full bg-[#047D7D] text-white py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-[#036565] transition-smooth disabled:opacity-50 shadow-xl shadow-[#047D7D]/20 mt-2"
              >
                Confirmar y Avanzar
              </button>
            </div>
          )}

          {/* LEGAL -> FIRMA */}
          {comprador.estado === 'Legal' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold text-surface-500 uppercase mb-1">Resumen Legal / Datos del Contrato</label>
                <textarea 
                  value={datosLegales}
                  onChange={(e) => setDatosLegales(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-surface-300 rounded-xl text-sm"
                  rows={3}
                  placeholder="Ingrese detalles legales aquí..."
                  disabled={usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Legal'}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-surface-500 uppercase mb-2">Proyecto de Contrato (PDF) *</label>
                <input 
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'contrato')}
                  className="hidden"
                />
                <div className="flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={subiendo || (usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Legal')}
                    className={`w-full border-2 border-dashed rounded-xl py-4 flex flex-col items-center justify-center transition-all group disabled:opacity-50 ${contratoUrl ? 'bg-emerald-50 border-emerald-300' : 'border-surface-300 hover:border-primary-500 hover:bg-primary-50/30'}`}
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{contratoUrl ? '✅' : '📄'}</span>
                    <span className={`text-xs font-bold ${contratoUrl ? 'text-emerald-700' : 'text-surface-600 group-hover:text-primary-600'}`}>
                      {subiendo ? 'Subiendo archivo...' : contratoUrl ? '¡Archivo Cargado!' : 'Seleccionar archivo PDF'}
                    </span>
                    <p className="text-[10px] text-surface-400 mt-1">{contratoUrl ? 'Listo para enviar' : 'Máximo 10MB • Solo formato PDF'}</p>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleDescartarOperacion}
                  disabled={usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Legal'}
                  className="bg-rose-50 text-rose-600 border border-rose-200 py-3 rounded-xl text-xs font-bold hover:bg-rose-100 transition-smooth disabled:opacity-50"
                >
                  Descartar Operación
                </button>
                <button 
                  onClick={handleLegalTransition}
                  disabled={!datosLegales || !contratoUrl || (usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Legal')}
                  className="bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-700 transition-smooth disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  Enviar a Firma
                </button>
              </div>
            </div>
          )}

          {/* FIRMA -> CIERRE */}
          {comprador.estado === 'Firma' && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl mb-4">
                <span className="text-2xl">✍️</span>
                <p className="text-xs font-bold text-purple-800 mt-2">Etapa de Formalización</p>
                <p className="text-[10px] text-purple-600 mt-1 italic">El contrato legal ha sido generado. Favor subir el documento firmado.</p>
              </div>
              
              <div className="text-left">
                <label className="block text-[10px] font-bold text-surface-500 uppercase mb-2">Contrato Firmado (PDF) *</label>
                <input 
                  type="file"
                  ref={firmaInputRef}
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'firma')}
                  className="hidden"
                />
                <div className="flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => firmaInputRef.current?.click()}
                    disabled={subiendo || (usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Comercial')}
                    className={`w-full border-2 border-dashed rounded-xl py-4 flex flex-col items-center justify-center transition-all group disabled:opacity-50 ${contratoFirmadoUrl ? 'bg-purple-100 border-purple-400' : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'}`}
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{contratoFirmadoUrl ? '✅' : '🖋️'}</span>
                    <span className={`text-xs font-bold ${contratoFirmadoUrl ? 'text-purple-800' : 'text-purple-600 group-hover:text-purple-700'}`}>
                      {subiendo ? 'Subiendo archivo...' : contratoFirmadoUrl ? '¡Contrato Firmado Cargado!' : 'Seleccionar contrato firmado'}
                    </span>
                    <p className="text-[10px] text-purple-400 mt-1">{contratoFirmadoUrl ? 'Operación lista para cierre' : 'Sube el PDF con las firmas correspondientes'}</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleDescartarOperacion}
                  disabled={usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Comercial'}
                  className="bg-rose-50 text-rose-600 border border-rose-200 py-3 rounded-xl text-xs font-bold hover:bg-rose-100 transition-smooth disabled:opacity-50"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleFirmaTransition}
                  disabled={!contratoFirmadoUrl || subiendo || (usuarioActual?.rol !== 'Admin' && usuarioActual?.rol !== 'Comercial')}
                  className="bg-purple-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-purple-700 transition-smooth disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  Finalizar Venta
                </button>
              </div>
            </div>
          )}

          {/* CIERRE */}
          {comprador.estado === 'Cierre' && (
            <div className="p-8 bg-emerald-500 rounded-2xl text-center text-white shadow-2xl animate-scale-in">
              <span className="text-5xl mb-4 block animate-bounce">🏆</span>
              <h3 className="text-xl font-black uppercase tracking-tighter">Venta Exitosa</h3>
              <p className="text-sm font-medium mt-2 opacity-90">Esta operación ha sido completada satisfactoriamente.</p>
              {comprador.fechaCierre && (
                <p className="text-[10px] mt-4 font-mono opacity-70">Cierre: {new Date(comprador.fechaCierre).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* PERDIDO */}
          {comprador.estado === 'Perdido' && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 animate-fade-in">
              <span className="text-4xl mb-2 block opacity-50">💔</span>
              <h3 className="text-sm font-bold uppercase">Operación Descartada</h3>
              <p className="text-xs mt-1">El cliente no mostró interés o no se llegó a un acuerdo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TimelineTab: FC<{ comprador: any; agregarActividad: any; eliminarActividad: any; isReadOnly: boolean }> = ({
  comprador, agregarActividad, eliminarActividad, isReadOnly
}) => {
  const [tipoActividad, setTipoActividad] = useState<any>('Llamada');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [resultado, setResultado] = useState('');
  const usuarioActual = useUsuarioActual();

  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultado.trim()) return;

    agregarActividad(comprador.id, {
      tipo: tipoActividad,
      fecha,
      responsable: usuarioActual?.nombre || 'Desconocido',
      resultado: resultado.trim(),
    });

    setResultado('');
  };

  return (
    <div className="p-6">
      {!isReadOnly && (
        <form onSubmit={handleAgregar} className="mb-8 bg-surface-50 p-4 rounded-xl border border-surface-200 shadow-inner">
          <h4 className="text-xs font-bold text-surface-700 uppercase mb-3 flex items-center gap-2">
            <span className="text-primary-500">📝</span> Registrar Bitácora
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-[10px] font-semibold text-surface-500 uppercase mb-1">Evento</label>
              <select
                value={tipoActividad}
                onChange={(e) => setTipoActividad(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="Llamada">📞 Llamada</option>
                <option value="Visita">🏠 Visita</option>
                <option value="Reunión">🤝 Reunión</option>
                <option value="Validación">✅ Validación</option>
                <option value="Otro">➕ Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-surface-500 uppercase mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-[10px] font-semibold text-surface-500 uppercase mb-1">Detalle / Resultado</label>
            <textarea
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              required
              rows={2}
              placeholder="¿Qué ocurrió en esta interacción?"
              className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm resize-none focus:outline-none focus:border-primary-500"
            />
          </div>
          <button type="submit" className="w-full bg-[#047D7D] text-white py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer">
            Guardar en Bitácora
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comprador.actividades.length === 0 ? (
          <div className="text-center py-12 text-surface-400">
             <span className="text-3xl block mb-2 opacity-30">⏳</span>
             <p className="text-xs font-medium">No hay registros aún.</p>
          </div>
        ) : (
          [...comprador.actividades].reverse().map((act: any) => (
            <div key={act.id} className="bg-white border border-surface-200 p-4 rounded-xl flex justify-between group hover:shadow-md transition-smooth relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-100 group-hover:bg-primary-500 transition-colors"></div>
              <div className="pl-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-surface-800 uppercase tracking-tight">{act.tipo}</span>
                  <span className="text-[10px] text-surface-400 font-mono">{act.fecha}</span>
                </div>
                <p className="text-[10px] text-surface-500 mb-2 font-medium">Por: {act.responsable}</p>
                <p className="text-sm text-surface-700 leading-relaxed">{act.resultado}</p>
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => eliminarActividad(comprador.id, act.id)}
                  className="text-surface-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg h-fit transition-all"
                  title="Eliminar registro"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompradorDetailModal;

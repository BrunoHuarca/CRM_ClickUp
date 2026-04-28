import { type FC, type FormEvent, useState } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useUsuarioActual } from '../hooks/usePermisos';
import { TIPOS_INMUEBLE, AVATAR_GRADIENTS } from '../constants';
import type { EstadoFolio, ScoreFolio, TipoInmueble } from '../types';
import MapSelector from './MapSelector';

const CrearFolioModal: FC = () => {
  const modalAbierto = useFolioStore((s) => s.modalAbierto);
  const cerrarModal = useFolioStore((s) => s.cerrarModal);
  const agregarFolio = useFolioStore((s) => s.agregarFolio);
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActual = useUsuarioActual();

  const agentesComerciales = usuarios.filter((u) => u.activo && u.rol === 'Comercial');

  // DATOS GENERALES
  const [estado, setEstado] = useState<EstadoFolio>('Captación');
  const [responsableId, setResponsableId] = useState('');

  // DATOS DEL INMUEBLE
  const [tipoInmueble, setTipoInmueble] = useState<TipoInmueble>('Casa');
  const [metraje, setMetraje] = useState('');
  const [antiguedad, setAntiguedad] = useState('');
  const [partidaRegistral, setPartidaRegistral] = useState('');
  const [precioEsperado, setPrecioEsperado] = useState('');
  const [precioSugerido, setPrecioSugerido] = useState('');
  const [urgenciaVenta, setUrgenciaVenta] = useState('Media');
  const [departamento, setDepartamento] = useState('');
  const [provincia, setProvincia] = useState('');
  const [distrito, setDistrito] = useState('');
  const [latitud, setLatitud] = useState<number | ''>('');
  const [longitud, setLongitud] = useState<number | ''>('');

  // DATOS DEL PROPIETARIO
  const [origen, setOrigen] = useState<'Meta' | 'Orgánico' | 'Referido'>('Orgánico');
  const [propietarioNombre, setPropietarioNombre] = useState('');
  const [propietarioDni, setPropietarioDni] = useState('');
  const [cantidadPropietarios, setCantidadPropietarios] = useState('1');
  const [propietarioTelefono, setPropietarioTelefono] = useState('');
  const [propietarioEmail, setPropietarioEmail] = useState('');
  const [score, setScore] = useState<ScoreFolio>('B');

  const [activeTab, setActiveTab] = useState<'general' | 'inmueble' | 'propietario'>('general');

  const resetForm = () => {
    setEstado('Captación');
    setResponsableId('');

    setTipoInmueble('Casa');
    setMetraje('');
    setAntiguedad('');
    setPartidaRegistral('');
    setPrecioEsperado('');
    setPrecioSugerido('');
    setUrgenciaVenta('Media');
    setDepartamento('');
    setProvincia('');
    setDistrito('');
    setLatitud('');
    setLongitud('');

    setOrigen('Orgánico');
    setPropietarioNombre('');
    setPropietarioDni('');
    setCantidadPropietarios('1');
    setPropietarioTelefono('');
    setPropietarioEmail('');
    setScore('B');

    setActiveTab('general');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !propietarioNombre.trim() ||
      !metraje ||
      !precioEsperado ||
      latitud === '' ||
      longitud === ''
    ) {
      alert('Por favor completa todos los campos requeridos y selecciona una ubicación en el mapa.');
      return;
    }

    const selectedUser = usuarios.find((u) => u.id === responsableId);
    const responsableNombre = selectedUser?.nombre || 'Sin asignar';

    agregarFolio({
      estado,
      tipoInmueble,
      metraje: Number(metraje),
      antiguedad: Number(antiguedad) || 0,
      partidaRegistral,
      precioEsperado: Number(precioEsperado),
      precioSugerido: Number(precioSugerido || precioEsperado),
      urgenciaVenta,
      departamento: departamento.trim(),
      provincia: provincia.trim(),
      distrito: distrito.trim(),
      latitud: Number(latitud),
      longitud: Number(longitud),
      origen,
      propietarioNombre: propietarioNombre.trim(),
      propietarioDni: propietarioDni.trim(),
      cantidadPropietarios: Number(cantidadPropietarios),
      propietarioTelefono: propietarioTelefono.trim(),
      propietarioEmail: propietarioEmail.trim(),
      score,
      responsable: usuarioActual?.nombre || 'Desconocido',
      // hidden fields:
      fechaCierre: undefined,
      tiempoTotalProceso: undefined,
      responsablePrincipal: responsableNombre,
    });

    resetForm();
    cerrarModal();
  };

  if (!modalAbierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrarModal();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 animate-scale-in flex flex-col max-h-full">
        {/* Header */}
        <div className="bg-[#047D7D] px-6 py-5 shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Crear Nuevo Folio</h2>
              <p className="text-[#44DE88] text-sm mt-0.5">
                Ingresa los datos del inmueble y propietario
              </p>
            </div>
            <button
              onClick={cerrarModal}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-smooth cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-200 shrink-0 bg-surface-50 px-6">
          {(['general', 'inmueble', 'propietario'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 text-sm font-bold border-b-2 transition-smooth cursor-pointer uppercase tracking-wider ${
                activeTab === tab
                  ? 'border-[#047D7D] text-[#047D7D] bg-white'
                  : 'border-transparent text-surface-500 hover:text-surface-700 hover:bg-surface-100'
              }`}
            >
              {tab === 'general' ? 'Datos Generales' : tab === 'inmueble' ? 'Inmueble' : 'Propietario'}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form id="crear-folio-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* TAB: GENERAL */}
            <div className={activeTab === 'general' ? 'block animate-fade-in' : 'hidden'}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Estado Inicial</label>
                  <select
                    value={estado}
                    disabled
                    className="w-full px-3 py-2.5 bg-surface-100 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth cursor-not-allowed opacity-70"
                  >
                    <option value="Captación">Captación</option>
                    <option value="Comercial">Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Responsable de Registro</label>
                  <input
                    type="text"
                    value={usuarioActual?.nombre || ''}
                    disabled
                    className="w-full px-3 py-2.5 bg-surface-100 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth cursor-not-allowed opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Comercial Responsable *</label>
                  <div className="relative">
                    <select
                      value={responsableId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setResponsableId(val);
                        setEstado(val ? 'Comercial' : 'Captación');
                      }}
                      required={false}
                      className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth pl-10"
                    >
                      <option value="">Seleccionar Comercial...</option>
                      {agentesComerciales.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                    {responsableId && (() => {
                      const selected = usuarios.find((u) => u.id === responsableId);
                      if (!selected) return null;
                      const grad = AVATAR_GRADIENTS[selected.color] || AVATAR_GRADIENTS.purple;
                      return (
                        <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center pointer-events-none`}>
                          <span className="text-white text-[8px] font-bold">{selected.avatar}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Fecha de Creación</label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString()}
                    disabled
                    className="w-full px-3 py-2.5 bg-surface-100 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth cursor-not-allowed opacity-70"
                  />
                </div>
              </div>
            </div>

            {/* TAB: INMUEBLE */}
            <div className={activeTab === 'inmueble' ? 'block animate-fade-in' : 'hidden'}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Tipo de Inmueble</label>
                  <select
                    value={tipoInmueble}
                    onChange={(e) => setTipoInmueble(e.target.value as TipoInmueble)}
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  >
                    {TIPOS_INMUEBLE.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Metraje (m²) *</label>
                  <input
                    type="number"
                    value={metraje}
                    onChange={(e) => setMetraje(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Antigüedad (Años)</label>
                  <input
                    type="number"
                    min="0"
                    value={antiguedad}
                    onChange={(e) => setAntiguedad(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">N° Partida Registral</label>
                  <input
                    type="text"
                    value={partidaRegistral}
                    onChange={(e) => setPartidaRegistral(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Departamento</label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="Ej. Lima"
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Provincia</label>
                  <input
                    type="text"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    placeholder="Ej. Lima"
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Distrito</label>
                  <input
                    type="text"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    placeholder="Ej. Miraflores"
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Precio Esperado (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">$</span>
                    <input
                      type="number"
                      value={precioEsperado}
                      onChange={(e) => setPrecioEsperado(e.target.value)}
                      required
                      className="w-full pl-7 pr-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Precio Sugerido (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">$</span>
                    <input
                      type="number"
                      value={precioSugerido}
                      onChange={(e) => setPrecioSugerido(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Urgencia de Venta</label>
                  <select
                    value={urgenciaVenta}
                    onChange={(e) => setUrgenciaVenta(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Ubicación (Haz clic en el mapa) *</label>
                  <MapSelector
                    initialLat={latitud || undefined}
                    initialLng={longitud || undefined}
                    onLocationSelect={(lat, lng) => {
                      setLatitud(lat);
                      setLongitud(lng);
                    }}
                  />
                  {latitud !== '' && longitud !== '' && (
                    <p className="text-xs text-surface-500 mt-2">
                      Coordenadas: {latitud.toFixed(5)}, {longitud.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* TAB: PROPIETARIO */}
            <div className={activeTab === 'propietario' ? 'block animate-fade-in' : 'hidden'}>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Nombre Completo *</label>
                  <input
                    type="text"
                    value={propietarioNombre}
                    onChange={(e) => setPropietarioNombre(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">DNI / RUC *</label>
                  <input
                    type="text"
                    value={propietarioDni}
                    onChange={(e) => setPropietarioDni(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Teléfono Propietario *</label>
                  <input
                    type="tel"
                    value={propietarioTelefono}
                    onChange={(e) => setPropietarioTelefono(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Email Propietario</label>
                  <input
                    type="email"
                    value={propietarioEmail}
                    onChange={(e) => setPropietarioEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Origen</label>
                  <select
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  >
                    <option value="Meta">Meta</option>
                    <option value="Orgánico">Orgánico</option>
                    <option value="Referido">Referido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Cantidad de Propietarios</label>
                  <input
                    type="number"
                    min="1"
                    value={cantidadPropietarios}
                    onChange={(e) => setCantidadPropietarios(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Score</label>
                  <div className="flex gap-2">
                    {(['A', 'B', 'C'] as ScoreFolio[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScore(s)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-smooth cursor-pointer border ${
                          score === s
                            ? s === 'A'
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                              : s === 'B'
                              ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                              : 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                            : 'bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 shrink-0 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={() => {
              resetForm();
              cerrarModal();
            }}
            className="py-2.5 px-6 border border-surface-200 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-smooth cursor-pointer"
          >
            Cancelar
          </button>
          <button
            form="crear-folio-form"
            type="submit"
            className="py-2.5 px-8 bg-[#047D7D] text-white rounded-xl text-sm font-semibold hover:bg-[#036565] transition-smooth shadow-lg shadow-[#047D7D]/25 cursor-pointer active:scale-[0.98]"
          >
            Guardar Folio
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearFolioModal;

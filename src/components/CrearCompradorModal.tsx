import { type FC, type FormEvent, useState, useEffect } from 'react';
import { useCompradorStore } from '../store/useCompradorStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useUsuarioActual } from '../hooks/usePermisos';
import { AVATAR_GRADIENTS } from '../constants';
import type { EstadoComprador, ScoreFolio, TipoInmueble } from '../types';

const TIPOS_INMUEBLE_BUSCA: (TipoInmueble | 'Indistinto')[] = ['Casa', 'Departamento', 'Terreno', 'Indistinto'];

const CrearCompradorModal: FC = () => {
  const modalAbierto = useCompradorStore((s) => s.modalCrearAbierto);
  const cerrarModal = useCompradorStore((s) => s.cerrarModalCrear);
  const agregarComprador = useCompradorStore((s) => s.agregarComprador);
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActual = useUsuarioActual();

  const [estado] = useState<EstadoComprador>('Captación');
  const [responsableId, setResponsableId] = useState('');

  const [nombre, setNombre] = useState('');
  const [origen, setOrigen] = useState<'Meta' | 'Orgánico' | 'Referido'>('Orgánico');
  const [inversionEstimada, setInversionEstimada] = useState('');
  const [tipoInmuebleBusca, setTipoInmuebleBusca] = useState<TipoInmueble | 'Indistinto'>('Indistinto');
  const [urgencia, setUrgencia] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [score, setScore] = useState<ScoreFolio>('B');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (usuarioActual && modalAbierto) {
      setResponsableId(usuarioActual.id);
    }
  }, [usuarioActual, modalAbierto]);

  const resetForm = () => {
    setResponsableId('');
    setNombre('');
    setOrigen('Orgánico');
    setInversionEstimada('');
    setTipoInmuebleBusca('Indistinto');
    setUrgencia('Media');
    setScore('B');
    setTelefono('');
    setEmail('');
    setNotas('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const puedeCrear = usuarioActual?.rol === 'Admin' || usuarioActual?.rol === 'Call Center';
    
    if (!puedeCrear) {
      alert('Solo el personal de Call Center o Administradores pueden registrar nuevos compradores.');
      return;
    }

    if (!nombre.trim() || !inversionEstimada) {
      alert('Por favor completa el nombre y la inversión estimada.');
      return;
    }

    const selectedUser = usuarios.find((u) => u.id === responsableId);
    const responsableNombre = selectedUser?.nombre || usuarioActual?.nombre || 'Sin asignar';

    agregarComprador({
      estado,
      nombre: nombre.trim(),
      origen,
      inversionEstimada: Number(inversionEstimada),
      tipoInmuebleBusca,
      urgencia,
      score,
      responsable: responsableNombre,
      telefono: telefono.trim(),
      email: email.trim(),
      notas: notas.trim(),
    });

    resetForm();
    cerrarModal();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 py-8 ${
        modalAbierto ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrarModal();
      }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transition-transform duration-300 flex flex-col max-h-full ${
        modalAbierto ? 'scale-100' : 'scale-95'
      }`}>
        {/* Header */}
        <div className="bg-[#047D7D] px-6 py-5 shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Registrar Comprador</h2>
              <p className="text-[#44DE88] text-sm mt-0.5">
                Ingresa los datos del nuevo cliente interesado
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

        {/* Form Body */}
        <form id="crear-comprador-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Nombre Completo *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Inversión Estimada (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">$</span>
                <input
                  type="number"
                  value={inversionEstimada}
                  onChange={(e) => setInversionEstimada(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Tipo Inmueble que Busca</label>
              <select
                value={tipoInmuebleBusca}
                onChange={(e) => setTipoInmuebleBusca(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
              >
                {TIPOS_INMUEBLE_BUSCA.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
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
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Urgencia</label>
              <select
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
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

            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Responsable</label>
              <div className="relative">
                <select
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                  disabled={!!usuarioActual}
                  className="w-full px-3 py-2.5 bg-surface-100 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth pl-10 cursor-not-allowed opacity-80"
                >
                  <option value="">Seleccionar Responsable...</option>
                  {usuarios.filter(u => u.activo).map((u) => (
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

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase">Notas u Observaciones</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-[#047D7D] transition-smooth resize-none"
              ></textarea>
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
            form="crear-comprador-form"
            type="submit"
            className="py-2.5 px-8 bg-[#047D7D] text-white rounded-xl text-sm font-semibold hover:bg-[#036565] transition-smooth shadow-lg shadow-[#047D7D]/25 cursor-pointer active:scale-[0.98]"
          >
            Guardar Comprador
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearCompradorModal;

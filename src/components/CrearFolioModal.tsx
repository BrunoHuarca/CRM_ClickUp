import { type FC, type FormEvent, useState } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { TIPOS_INMUEBLE, AVATAR_GRADIENTS } from '../constants';
import type { EstadoFolio, ScoreFolio, TipoInmueble } from '../types';

const CrearFolioModal: FC = () => {
  const modalAbierto = useFolioStore((s) => s.modalAbierto);
  const cerrarModal = useFolioStore((s) => s.cerrarModal);
  const agregarFolio = useFolioStore((s) => s.agregarFolio);
  const usuarios = useUsuarioStore((s) => s.usuarios);

  const agentes = usuarios.filter((u) => u.activo && (u.rol === 'Comercial' || u.rol === 'Admin'));

  const [tipoInmueble, setTipoInmueble] = useState<TipoInmueble>('Casa');
  const [propietario, setPropietario] = useState('');
  const [responsableId, setResponsableId] = useState(agentes[0]?.id || '');
  const [score, setScore] = useState<ScoreFolio>('B');
  const [estado, setEstado] = useState<EstadoFolio>('captacion');
  const [direccion, setDireccion] = useState('');
  const [precio, setPrecio] = useState('');

  const resetForm = () => {
    setTipoInmueble('Casa');
    setPropietario('');
    setResponsableId(agentes[0]?.id || '');
    setScore('B');
    setEstado('captacion');
    setDireccion('');
    setPrecio('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!propietario.trim() || !responsableId) return;

    const selectedUser = usuarios.find((u) => u.id === responsableId);
    const responsableNombre = selectedUser?.nombre || 'Sin asignar';

    agregarFolio({
      estado,
      tipoInmueble,
      propietario: propietario.trim(),
      responsable: responsableNombre,
      score,
      direccion: direccion.trim() || undefined,
      precio: precio ? Number(precio) : undefined,
    });

    resetForm();
    cerrarModal();
  };

  if (!modalAbierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrarModal();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Crear Nuevo Folio</h2>
              <p className="text-primary-200 text-xs mt-0.5">
                Ingresa los datos del inmueble
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Tipo + Score */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">
                Tipo de Inmueble
              </label>
              <select
                id="input-tipo-inmueble"
                value={tipoInmueble}
                onChange={(e) => setTipoInmueble(e.target.value as TipoInmueble)}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
              >
                {TIPOS_INMUEBLE.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">
                Score
              </label>
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

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">
              Etapa Inicial
            </label>
            <select
              id="input-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoFolio)}
              className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth"
            >
              <option value="captacion">Captación</option>
              <option value="legal">Legal</option>
              <option value="marketing">Marketing</option>
              <option value="venta">Venta</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          {/* Propietario */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">
              Propietario *
            </label>
            <input
              id="input-propietario"
              type="text"
              value={propietario}
              onChange={(e) => setPropietario(e.target.value)}
              placeholder="Nombre del propietario"
              required
              className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth placeholder:text-surface-400"
            />
          </div>

          {/* Asignado a (dropdown from real users) */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">
              Asignado a *
            </label>
            <div className="relative">
              <select
                id="input-responsable"
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth pl-10"
              >
                {agentes.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} — {u.rol}
                  </option>
                ))}
              </select>
              {/* Avatar preview */}
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

          {/* Dirección */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">
              Dirección
            </label>
            <input
              id="input-direccion"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección del inmueble"
              className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth placeholder:text-surface-400"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">
              Precio (PEN)
            </label>
            <input
              id="input-precio"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-smooth placeholder:text-surface-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                cerrarModal();
              }}
              className="flex-1 py-2.5 px-4 border border-surface-200 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 transition-smooth cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-guardar-folio"
              type="submit"
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-smooth shadow-lg shadow-primary-500/25 cursor-pointer active:scale-[0.98]"
            >
              Guardar Folio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearFolioModal;

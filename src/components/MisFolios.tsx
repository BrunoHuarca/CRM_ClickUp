import { type FC, useState, useMemo } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioActual } from '../hooks/usePermisos';
import { SCORE_CONFIG } from '../constants';

const MisFolios: FC = () => {
  const folios = useFolioStore((s) => s.folios);
  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const usuario = useUsuarioActual();

  const [verTodos, setVerTodos] = useState(false);

  const isAdmin = usuario?.rol === 'Admin';

  const foliosVisibles = useMemo(() => {
    if (isAdmin && verTodos) {
      return folios;
    }
    return folios.filter((f) => f.responsable === usuario?.nombre);
  }, [folios, usuario, isAdmin, verTodos]);

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-100 flex-1 overflow-x-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Mis Folios Asignados</h2>
          <p className="text-sm text-surface-500 mt-1">
            Gestiona los folios que tienes asignados actualmente.
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-surface-200">
            <span className={`text-xs font-semibold ${!verTodos ? 'text-[#047D7D]' : 'text-surface-400'}`}>Solo Míos</span>
            <button
              onClick={() => setVerTodos(!verTodos)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                verTodos ? 'bg-[#047D7D]' : 'bg-surface-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  verTodos ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${verTodos ? 'text-[#047D7D]' : 'text-surface-400'}`}>Ver Todos</span>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#047D7D] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">ID Folio</th>
                <th className="px-6 py-4 font-semibold">Propietario</th>
                <th className="px-6 py-4 font-semibold">Tipo de Inmueble</th>
                <th className="px-6 py-4 font-semibold">Estado Actual</th>
                <th className="px-6 py-4 font-semibold">Fecha de Creación</th>
                <th className="px-6 py-4 font-semibold text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 text-[#4A494A]">
              {foliosVisibles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-surface-500 font-medium">No tienes folios asignados actualmente</p>
                  </td>
                </tr>
              ) : (
                foliosVisibles.map((folio) => {
                  const scoreConfig = SCORE_CONFIG[folio.score];
                  return (
                    <tr
                      key={folio.id}
                      onClick={() => abrirDetalle(folio.id)}
                      className="hover:bg-surface-50 transition-smooth cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs">{folio.id}</td>
                      <td className="px-6 py-4 font-medium">{folio.propietarioNombre || '—'}</td>
                      <td className="px-6 py-4">{folio.tipoInmueble}</td>
                      <td className="px-6 py-4">
                        <span className="bg-surface-100 text-surface-700 px-2.5 py-1 rounded-md text-xs font-medium border border-surface-200">
                          {folio.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-surface-500">
                        {formatDate(folio.fechaCreacion)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${scoreConfig.color}`}
                        >
                          {folio.score}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-surface-50 border-t border-surface-200 px-6 py-3 shrink-0">
          <p className="text-xs text-surface-500 font-medium">
            Total listados: {foliosVisibles.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MisFolios;

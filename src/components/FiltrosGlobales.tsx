import { type FC } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';

const FiltrosGlobales: FC = () => {
  const filtros = useFolioStore((s) => s.filtros);
  const setFiltros = useFolioStore((s) => s.setFiltros);
  const usuarios = useUsuarioStore((s) => s.usuarios);

  const resetFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      score: 'Todos',
      responsableId: 'Todos',
    });
  };

  const hayFiltrosActivos =
    filtros.fechaInicio !== '' ||
    filtros.fechaFin !== '' ||
    filtros.score !== 'Todos' ||
    filtros.responsableId !== 'Todos';

  return (
    <div className="bg-white px-5 py-3 border-b border-surface-200 flex flex-wrap items-center gap-4 text-sm shadow-sm z-10 relative animate-slide-in">
      <div className="flex items-center gap-2 text-surface-500 font-medium">
        <span className="text-lg">⚙</span> Filtros:
      </div>

      <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5 border border-surface-200">
        <span className="text-surface-500 text-xs uppercase tracking-wider">Fechas</span>
        <input
          type="date"
          value={filtros.fechaInicio}
          onChange={(e) => setFiltros({ fechaInicio: e.target.value })}
          className="bg-transparent border-none outline-none text-surface-700 cursor-pointer"
        />
        <span className="text-surface-400">—</span>
        <input
          type="date"
          value={filtros.fechaFin}
          onChange={(e) => setFiltros({ fechaFin: e.target.value })}
          className="bg-transparent border-none outline-none text-surface-700 cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5 border border-surface-200">
        <span className="text-surface-500 text-xs uppercase tracking-wider">Score</span>
        <select
          value={filtros.score}
          onChange={(e) => setFiltros({ score: e.target.value as any })}
          className="bg-transparent border-none outline-none text-surface-700 cursor-pointer font-medium"
        >
          <option value="Todos">Cualquiera</option>
          <option value="A">Score A</option>
          <option value="B">Score B</option>
          <option value="C">Score C</option>
        </select>
      </div>

      <div className="flex items-center gap-2 bg-surface-50 rounded-lg px-3 py-1.5 border border-surface-200">
        <span className="text-surface-500 text-xs uppercase tracking-wider">Responsable</span>
        <select
          value={filtros.responsableId}
          onChange={(e) => setFiltros({ responsableId: e.target.value })}
          className="bg-transparent border-none outline-none text-surface-700 cursor-pointer font-medium"
        >
          <option value="Todos">Todos</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.nombre}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      {hayFiltrosActivos && (
        <button
          onClick={resetFiltros}
          className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-smooth cursor-pointer"
        >
          Limpiar Filtros
        </button>
      )}
    </div>
  );
};

export default FiltrosGlobales;

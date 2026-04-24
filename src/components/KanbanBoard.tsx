import { type FC } from 'react';
import { COLUMNAS_KANBAN } from '../constants';
import { usePermisos } from '../hooks/usePermisos';
import { useFoliosFiltrados } from '../hooks/useFoliosFiltrados';
import KanbanColumn from './KanbanColumn';
import FiltrosGlobales from './FiltrosGlobales';

const KanbanBoard: FC = () => {
  const foliosFiltrados = useFoliosFiltrados();
  const permisos = usePermisos();

  const columnasVisibles = COLUMNAS_KANBAN.filter((c) =>
    permisos.etapasVisibles.includes(c.id)
  );

  return (
    <div className="flex flex-col h-full bg-surface-100 flex-1 overflow-x-auto p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-surface-800">Tablero Kanban</h2>
        <p className="text-sm text-surface-500 mt-1 mb-4">
          Gestiona los folios y muévelos entre etapas
        </p>
        <FiltrosGlobales />
      </div>

      {/* Board */}
      <div className="flex gap-4 pb-4 mt-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar">
        {columnasVisibles.map((columna) => (
          <KanbanColumn
            key={columna.id}
            columna={columna}
            folios={foliosFiltrados.filter((f) => f.estado === columna.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;

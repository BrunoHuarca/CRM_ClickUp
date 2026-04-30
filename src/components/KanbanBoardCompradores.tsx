import { type FC } from 'react';
import { COLUMNAS_KANBAN_COMPRADOR } from '../constants/compradores';
import { useFolioStore } from '../store/useFolioStore';
import { useCompradoresFiltrados } from '../hooks/useCompradoresFiltrados';
import KanbanColumnCompradores from './KanbanColumnCompradores';
import FiltrosGlobales from './FiltrosGlobales';

const KanbanBoardCompradores: FC = () => {
  const compradoresFiltrados = useCompradoresFiltrados();

  return (
    <div className="flex flex-col h-full bg-surface-100 flex-1 overflow-x-auto p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Tablero Kanban Compradores</h2>
          <p className="text-sm text-surface-500 mt-1 mb-4">
            Gestiona los clientes/compradores y muévelos entre etapas
          </p>
        </div>
        <button
          onClick={() => useFolioStore.getState().setVistaActiva('cartelerapropiedades')}
          className="flex items-center gap-2 bg-white border border-surface-200 px-4 py-2 rounded-xl text-xs font-bold text-surface-600 hover:bg-surface-50 transition-smooth shadow-sm h-fit"
        >
          🏢 Ver Cartelera de Propiedades
        </button>
      </div>
      <FiltrosGlobales isCompradores={true} />

      {/* Board */}
      <div className="flex gap-4 pb-4 mt-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar">
        {COLUMNAS_KANBAN_COMPRADOR.map((columna) => (
          <KanbanColumnCompradores
            key={columna.id}
            columna={columna}
            compradores={compradoresFiltrados.filter((c) => c.estado === columna.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoardCompradores;

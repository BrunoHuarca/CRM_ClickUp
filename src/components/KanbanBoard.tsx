import { type FC, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  closestCorners,
} from '@dnd-kit/core';
import { useFolioStore } from '../store/useFolioStore';
import { COLUMNAS_KANBAN } from '../constants';
import type { EstadoFolio, Folio } from '../types';
import { usePermisos } from '../hooks/usePermisos';
import { useFoliosFiltrados } from '../hooks/useFoliosFiltrados';
import KanbanColumn from './KanbanColumn';
import FolioCard from './FolioCard';
import FiltrosGlobales from './FiltrosGlobales';

const KanbanBoard: FC = () => {
  const foliosFiltrados = useFoliosFiltrados();
  const folios = useFolioStore((s) => s.folios); // Used for drag handling to find original folio
  const moverFolio = useFolioStore((s) => s.moverFolio);
  const [activeFolio, setActiveFolio] = useState<Folio | null>(null);
  const permisos = usePermisos();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!permisos.puedeMoverFolio) return;
      const { active } = event;
      const folio = folios.find((f) => f.id === active.id);
      if (folio) setActiveFolio(folio);
    },
    [folios, permisos.puedeMoverFolio]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveFolio(null);

      if (!over) return;

      const folioId = active.id as string;

      // Determine target column
      let targetEstado: EstadoFolio | undefined;

      // Check if dropped over a column
      if (over.data.current?.type === 'column') {
        targetEstado = over.data.current.estado as EstadoFolio;
      }
      // Check if dropped over another folio card
      else if (over.data.current?.type === 'folio') {
        targetEstado = over.data.current.folio.estado as EstadoFolio;
      }
      // Check if the over.id matches a column id
      else {
        const columnaIds = COLUMNAS_KANBAN.map((c) => c.id as string);
        if (columnaIds.includes(over.id as string)) {
          targetEstado = over.id as EstadoFolio;
        }
      }

      if (targetEstado) {
        const folio = folios.find((f) => f.id === folioId);
        if (folio && folio.estado !== targetEstado) {
          moverFolio(folioId, targetEstado);
        }
      }
    },
    [folios, moverFolio, permisos.puedeMoverFolio]
  );

  const columnasVisibles = COLUMNAS_KANBAN.filter((c) =>
    permisos.etapasVisibles.includes(c.id)
  );

  return (
    <div className="flex flex-col h-full bg-surface-100 flex-1 overflow-x-auto p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-surface-800">Tablero Kanban</h2>
        <p className="text-sm text-surface-500 mt-1 mb-4">
          Arrastra los folios entre columnas para actualizar su estado
        </p>
        <FiltrosGlobales />
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 pb-4 mt-4">
          {columnasVisibles.map((columna) => (
            <KanbanColumn
              key={columna.id}
              columna={columna}
              folios={foliosFiltrados.filter((f) => f.estado === columna.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeFolio ? (
            <FolioCard folio={activeFolio} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;

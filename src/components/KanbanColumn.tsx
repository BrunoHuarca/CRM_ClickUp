import { type FC } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ColumnaKanban, Folio } from '../types';
import FolioCard from './FolioCard';

interface KanbanColumnProps {
  columna: ColumnaKanban;
  folios: Folio[];
}

const KanbanColumn: FC<KanbanColumnProps> = ({ columna, folios }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columna.id,
    data: {
      type: 'column',
      estado: columna.id,
    },
  });

  return (
    <div
      className={`flex flex-col min-w-[280px] max-w-[320px] flex-1 transition-smooth rounded-2xl ${
        isOver ? 'drop-target-active' : ''
      }`}
    >
      {/* Column Header */}
      <div
        className={`${columna.bgColor} border ${columna.borderColor} rounded-t-2xl px-4 py-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${columna.iconColor.replace('text-', 'bg-')}`}
            ></div>
            <h3 className={`font-semibold text-sm ${columna.color}`}>
              {columna.titulo}
            </h3>
          </div>
          <span
            className={`${columna.bgColor} border ${columna.borderColor} px-2 py-0.5 rounded-full text-xs font-bold ${columna.color}`}
          >
            {folios.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 bg-surface-50/50 border-x border-b border-surface-200 rounded-b-2xl p-3 space-y-3 min-h-[200px] overflow-y-auto max-h-[calc(100vh-220px)]"
      >
        <SortableContext
          items={folios.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {folios.map((folio) => (
            <FolioCard key={folio.id} folio={folio} />
          ))}
        </SortableContext>

        {folios.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-surface-400">
            <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-2">
              <span className="text-2xl opacity-50">📋</span>
            </div>
            <p className="text-xs font-medium">Sin folios</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;

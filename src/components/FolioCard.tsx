import { type FC, type MouseEvent, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Folio } from '../types';
import { SCORE_CONFIG, AVATAR_GRADIENTS } from '../constants';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useAlertasFolio } from '../hooks/useAlertasFolio';

interface FolioCardProps {
  folio: Folio;
  isDragOverlay?: boolean;
}

const FolioCard: FC<FolioCardProps> = ({ folio, isDragOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: folio.id,
    data: {
      type: 'folio',
      folio,
    },
  });

  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const alertas = useAlertasFolio(folio);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const scoreConfig = SCORE_CONFIG[folio.score];

  const formatPrice = (precio?: number) => {
    if (!precio) return null;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  };

  const handleClick = (e: MouseEvent) => {
    // Don't open detail when dragging
    if (isDragging) return;
    // Prevent opening if it was a drag gesture (moved more than 5px, handled by sensor)
    e.stopPropagation();
    abrirDetalle(folio.id);
  };

  const totalCostos = (folio.costos || []).reduce((sum, c) => sum + c.monto, 0);
  const numActividades = (folio.actividades || []).length;

  if (isDragOverlay) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-2xl border border-primary-200 rotate-2 w-72">
        <CardContent
          folio={folio}
          scoreConfig={scoreConfig}
          formatPrice={formatPrice}
          formatDate={formatDate}
          alertas={[]}
          totalCostos={totalCostos}
          numActividades={numActividades}
        />
      </div>
    );
  }

  const isCerrado = folio.estado === 'cerrado';
  const campanaPausada = folio.campanaPausada && isCerrado;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`rounded-xl p-4 shadow-sm border hover:shadow-md transition-smooth cursor-grab active:cursor-grabbing group animate-slide-in relative ${
        campanaPausada
          ? 'bg-surface-50 border-surface-300 opacity-80'
          : alertas.length > 0
          ? 'bg-white border-orange-200 ring-1 ring-orange-100'
          : 'bg-white border-surface-200 hover:border-primary-200'
      }`}
    >
      {/* Campaign Paused Ribbon */}
      {campanaPausada && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-[9px] font-bold text-center py-1 rounded-t-xl flex items-center justify-center gap-1">
          <span>⏸️</span> Campaña Detenida
        </div>
      )}

      {/* Alert indicators */}
      {alertas.length > 0 && !campanaPausada && (
        <div className="absolute -top-1.5 -right-1.5 flex gap-1">
          {alertas.some((a) => a.tipo === 'inactividad') && (
            <span
              className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] shadow-sm pulse-glow"
              title="Inactividad prolongada"
            >
              ⏰
            </span>
          )}
          {alertas.some((a) => a.tipo === 'score_bajo') && (
            <span
              className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] shadow-sm"
              title="Score bajo"
            >
              ⚠️
            </span>
          )}
        </div>
      )}

      <CardContent
        folio={folio}
        scoreConfig={scoreConfig}
        formatPrice={formatPrice}
        formatDate={formatDate}
        alertas={alertas}
        totalCostos={totalCostos}
        numActividades={numActividades}
      />
    </div>
  );
};

interface CardContentProps {
  folio: Folio;
  scoreConfig: (typeof SCORE_CONFIG)[keyof typeof SCORE_CONFIG];
  formatPrice: (precio?: number) => string | null;
  formatDate: (fecha: string) => string;
  alertas: { tipo: string; mensaje: string }[];
  totalCostos: number;
  numActividades: number;
}

const CardContent: FC<CardContentProps> = ({
  folio,
  scoreConfig,
  formatPrice,
  formatDate,
  alertas,
  totalCostos,
  numActividades,
}) => (
  <>
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${scoreConfig.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${scoreConfig.dotColor}`}></span>
        {folio.score}
      </span>
      <span className="text-xs text-surface-400 font-mono">
        {folio.id.slice(0, 8)}
      </span>
    </div>

    {/* Alert banners */}
    {alertas.length > 0 && (
      <div className="mb-2 space-y-1">
        {alertas.map((alerta, i) => (
          <div
            key={i}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
              alerta.tipo === 'inactividad'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-orange-50 text-orange-700 border border-orange-200'
            }`}
          >
            {alerta.tipo === 'inactividad' ? '⏰' : '⚠️'} {alerta.mensaje}
          </div>
        ))}
      </div>
    )}

    {/* Property Type */}
    <div className="mb-2">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-500 bg-surface-100 px-2 py-0.5 rounded-md">
        🏠 {folio.tipoInmueble}
      </span>
    </div>

    {/* Price */}
    {folio.precio && (
      <p className="text-lg font-bold text-surface-800 mb-2">
        {formatPrice(folio.precio)}
      </p>
    )}

    {/* Address */}
    {folio.direccion && (
      <p className="text-xs text-surface-500 mb-3 line-clamp-2 leading-relaxed">
        📍 {folio.direccion}
      </p>
    )}

    {/* Mini stats */}
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded">
        📋 {numActividades} act.
      </span>
      {totalCostos > 0 && (
        <span className="text-[10px] text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded">
          💸 {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(totalCostos)}
        </span>
      )}
    </div>

    {/* Footer */}
    <AvatarFooter responsable={folio.responsable} fecha={folio.fechaCreacion} formatDate={formatDate} />

    {/* Owner */}
    <div className="mt-2">
      <p className="text-[11px] text-surface-400">
        <span className="font-medium text-surface-500">Propietario:</span>{' '}
        {folio.propietario}
      </p>
    </div>
  </>
);

const AvatarFooter: FC<{ responsable: string; fecha: string; formatDate: (f: string) => string }> = ({
  responsable,
  fecha,
  formatDate,
}) => {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuario = useMemo(
    () => usuarios.find((u) => u.nombre === responsable),
    [usuarios, responsable]
  );

  const gradient = usuario
    ? AVATAR_GRADIENTS[usuario.color] || AVATAR_GRADIENTS.purple
    : 'from-primary-400 to-primary-600';
  const initials = usuario?.avatar || responsable.charAt(0);

  return (
    <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-white text-[10px] font-bold">{initials}</span>
        </div>
        <span className="text-xs text-surface-600 font-medium truncate max-w-[100px]">
          {responsable}
        </span>
      </div>
      <span className="text-[10px] text-surface-400">
        {formatDate(fecha)}
      </span>
    </div>
  );
};

export default FolioCard;

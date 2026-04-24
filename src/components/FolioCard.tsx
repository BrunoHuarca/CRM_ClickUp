import { type FC, type MouseEvent, useMemo, useState } from 'react';
import type { Folio } from '../types';
import { SCORE_CONFIG, AVATAR_GRADIENTS, COLUMNAS_KANBAN } from '../constants';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useAlertasFolio } from '../hooks/useAlertasFolio';
import MapModal from './MapModal';

interface FolioCardProps {
  folio: Folio;
}

const FolioCard: FC<FolioCardProps> = ({ folio }) => {
  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const moverFolio = useFolioStore((s) => s.moverFolio);
  const alertas = useAlertasFolio(folio);
  const [mapVisible, setMapVisible] = useState(false);

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
    e.stopPropagation();
    abrirDetalle(folio.id);
  };

  const currentColumnIndex = COLUMNAS_KANBAN.findIndex(c => c.id === folio.estado);
  const prevColumn = currentColumnIndex > 0 ? COLUMNAS_KANBAN[currentColumnIndex - 1] : null;
  const nextColumn = currentColumnIndex < COLUMNAS_KANBAN.length - 1 ? COLUMNAS_KANBAN[currentColumnIndex + 1] : null;

  const totalCostos = (folio.costos || []).reduce((sum, c) => sum + c.monto, 0);
  const numActividades = (folio.actividades || []).length;

  const isCerrado = folio.estado === 'cerrado';
  const campanaPausada = folio.campanaPausada && isCerrado;

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl p-4 shadow-sm border hover:shadow-md transition-smooth cursor-pointer animate-slide-in relative ${
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
        onOpenMap={(e) => {
          e.stopPropagation();
          setMapVisible(true);
        }}
      />

      {/* State Machine Buttons */}
      {!campanaPausada && (
        <div className="mt-3 flex gap-2">
          {prevColumn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                moverFolio(folio.id, prevColumn.id);
              }}
              className="flex-1 py-1.5 px-2 bg-surface-100 hover:bg-surface-200 text-surface-600 rounded-lg text-xs font-semibold border border-surface-200 transition-smooth"
            >
              ← {prevColumn.titulo}
            </button>
          )}
          {nextColumn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                moverFolio(folio.id, nextColumn.id);
              }}
              className="flex-1 py-1.5 px-2 bg-[#44DE88] hover:bg-[#3bcc79] text-surface-900 rounded-lg text-xs font-bold transition-smooth shadow-sm"
            >
              Avanzar →
            </button>
          )}
        </div>
      )}

      {mapVisible && folio.latitud && folio.longitud && (
        <MapModal
          latitud={folio.latitud}
          longitud={folio.longitud}
          propietario={folio.propietario}
          onClose={() => setMapVisible(false)}
        />
      )}
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
  onOpenMap: (e: MouseEvent) => void;
}

const CardContent: FC<CardContentProps> = ({
  folio,
  scoreConfig,
  formatPrice,
  formatDate,
  alertas,
  totalCostos,
  numActividades,
  onOpenMap,
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

    {/* Owner & Map Action */}
    <div className="mt-2 flex items-center justify-between">
      <p className="text-[11px] text-surface-400">
        <span className="font-medium text-surface-500">Propietario:</span>{' '}
        {folio.propietario}
      </p>
      {folio.latitud !== undefined && folio.longitud !== undefined && (
        <button
          onClick={onOpenMap}
          className="text-[10px] text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-smooth"
        >
          📍 Ver ubicación
        </button>
      )}
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

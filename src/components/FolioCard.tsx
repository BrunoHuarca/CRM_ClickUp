import { type FC, type MouseEvent, useState } from 'react';
import type { Folio } from '../types';
import { SCORE_CONFIG, AVATAR_GRADIENTS } from '../constants';
import { useFolioStore } from '../store/useFolioStore';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useAlertasFolio } from '../hooks/useAlertasFolio';
import MapModal from './MapModal';

interface FolioCardProps {
  folio: Folio;
}

const FolioCard: FC<FolioCardProps> = ({ folio }) => {
  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const alertas = useAlertasFolio(folio);
  const [mapVisible, setMapVisible] = useState(false);

  const scoreConfig = SCORE_CONFIG[folio.score];

  const formatPrice = (precio?: number) => {
    if (!precio) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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



  const totalCostos = (folio.costos || []).reduce((sum, c) => sum + c.monto, 0);
  const numActividades = (folio.actividades || []).length;

  const isCerrado = folio.estado === 'Publicado';
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



      {mapVisible && folio.latitud && folio.longitud && (
        <MapModal
          latitud={folio.latitud}
          longitud={folio.longitud}
          propietario={folio.propietarioNombre}
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
    {folio.precioEsperado && (
      <p className="text-lg font-bold text-surface-800 mb-2">
        {formatPrice(folio.precioEsperado)}
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
          💸 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalCostos)}
        </span>
      )}
    </div>

    {/* Footer */}
    <AvatarFooter 
      responsable={folio.responsable} 
      responsablePrincipal={folio.responsablePrincipal} 
      fecha={folio.fechaCreacion} 
      formatDate={formatDate} 
    />

    {/* Owner & Map Action */}
    <div className="mt-2 flex items-center justify-between">
      <p className="text-[11px] text-surface-400">
        <span className="font-medium text-surface-500">Propietario:</span>{' '}
        {folio.propietarioNombre}
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

const AvatarFooter: FC<{ responsable: string; responsablePrincipal?: string; fecha: string; formatDate: (f: string) => string }> = ({
  responsable,
  responsablePrincipal,
  fecha,
  formatDate,
}) => {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  
  const getAvatarData = (nombre: string) => {
    const u = usuarios.find((u) => u.nombre === nombre);
    const gradient = u ? AVATAR_GRADIENTS[u.color] || AVATAR_GRADIENTS.purple : 'from-surface-400 to-surface-600';
    const initials = u?.avatar || nombre.charAt(0);
    return { gradient, initials };
  };

  const reg = getAvatarData(responsable);
  const principal = responsablePrincipal ? getAvatarData(responsablePrincipal) : null;

  return (
    <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        <div 
          className={`w-6 h-6 rounded-full bg-gradient-to-br ${reg.gradient} flex items-center justify-center border-2 border-white`}
          title={`Registrado por: ${responsable}`}
        >
          <span className="text-white text-[8px] font-bold">{reg.initials}</span>
        </div>
        {principal && principal.initials !== reg.initials && (
          <div 
            className={`w-6 h-6 rounded-full bg-gradient-to-br ${principal.gradient} flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-[#047D7D]/20`}
            title={`Comercial: ${responsablePrincipal}`}
          >
            <span className="text-white text-[8px] font-bold">{principal.initials}</span>
          </div>
        )}
        <div className="ml-3 flex flex-col">
          <span className="text-[9px] text-surface-400 leading-none mb-0.5">Responsables</span>
          <span className="text-[10px] text-surface-700 font-bold leading-none truncate max-w-[80px]">
            {responsablePrincipal || responsable}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-surface-400 font-medium">
        {formatDate(fecha)}
      </span>
    </div>
  );
};

export default FolioCard;

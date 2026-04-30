import { type FC, type MouseEvent } from 'react';
import type { Comprador } from '../types';
import { SCORE_CONFIG, AVATAR_GRADIENTS } from '../constants';
import { useCompradorStore } from '../store/useCompradorStore';
import { useUsuarioStore } from '../store/useUsuarioStore';

interface CompradorCardProps {
  comprador: Comprador;
}

const CompradorCard: FC<CompradorCardProps> = ({ comprador }) => {
  const abrirDetalle = useCompradorStore((s) => s.abrirDetalle);

  const scoreConfig = SCORE_CONFIG[comprador.score];

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
    abrirDetalle(comprador.id);
  };

  const numActividades = (comprador.actividades || []).length;

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl p-4 shadow-sm border hover:shadow-md transition-smooth cursor-pointer animate-slide-in relative bg-white border-surface-200 hover:border-primary-200`}
    >
      <CardContent
        comprador={comprador}
        scoreConfig={scoreConfig}
        formatPrice={formatPrice}
        formatDate={formatDate}
        numActividades={numActividades}
      />
    </div>
  );
};

interface CardContentProps {
  comprador: Comprador;
  scoreConfig: (typeof SCORE_CONFIG)[keyof typeof SCORE_CONFIG];
  formatPrice: (precio?: number) => string | null;
  formatDate: (fecha: string) => string;
  numActividades: number;
}

const CardContent: FC<CardContentProps> = ({
  comprador,
  scoreConfig,
  formatPrice,
  formatDate,
  numActividades,
}) => (
  <>
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${scoreConfig.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${scoreConfig.dotColor}`}></span>
        {comprador.score}
      </span>
      <span className="text-xs text-surface-400 font-mono">
        {comprador.id.slice(0, 8)}
      </span>
    </div>

    {/* Origin */}
    <div className="mb-2 flex gap-2">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-500 bg-surface-100 px-2 py-0.5 rounded-md">
        🔍 {comprador.origen}
      </span>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-500 bg-surface-100 px-2 py-0.5 rounded-md">
        🏠 {comprador.tipoInmuebleBusca}
      </span>
    </div>

    {/* Name and Price */}
    <p className="text-lg font-bold text-surface-800 mb-1 leading-tight">
      {comprador.nombre}
    </p>
    {comprador.inversionEstimada > 0 && (
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-sm font-semibold text-emerald-600">
          {formatPrice(comprador.inversionEstimada)}
        </p>
        {comprador.folioVinculadoId && (
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-bold">
            🏢 {comprador.folioVinculadoId}
          </span>
        )}
      </div>
    )}

    {/* Mini stats */}
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded">
        📋 {numActividades} act.
      </span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
        ${comprador.urgencia === 'Alta' ? 'bg-red-50 text-red-600' : 
          comprador.urgencia === 'Media' ? 'bg-amber-50 text-amber-600' : 
          'bg-green-50 text-green-600'}`}>
        🔥 Urgencia: {comprador.urgencia}
      </span>
    </div>

    {/* Footer */}
    <AvatarFooter 
      responsable={comprador.responsable} 
      fecha={comprador.fechaCreacion} 
      formatDate={formatDate} 
    />
  </>
);

const AvatarFooter: FC<{ responsable: string; fecha: string; formatDate: (f: string) => string }> = ({
  responsable,
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

  return (
    <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
      <div className="flex items-center overflow-hidden">
        <div 
          className={`w-6 h-6 rounded-full bg-gradient-to-br ${reg.gradient} flex items-center justify-center border-2 border-white`}
          title={`Responsable: ${responsable}`}
        >
          <span className="text-white text-[8px] font-bold">{reg.initials}</span>
        </div>
        <div className="ml-3 flex flex-col">
          <span className="text-[9px] text-surface-400 leading-none mb-0.5">Responsable</span>
          <span className="text-[10px] text-surface-700 font-bold leading-none truncate max-w-[80px]">
            {responsable}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-surface-400 font-medium">
        {formatDate(fecha)}
      </span>
    </div>
  );
};

export default CompradorCard;

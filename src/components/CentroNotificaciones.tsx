import { type FC, useState, useRef, useEffect } from 'react';
import { useFolioStore } from '../store/useFolioStore';

const CentroNotificaciones: FC = () => {
  const notificaciones = useFolioStore((s) => s.notificaciones);
  const marcarNotificacionLeida = useFolioStore((s) => s.marcarNotificacionLeida);
  const marcarTodasLeidas = useFolioStore((s) => s.marcarTodasLeidas);
  const abrirDetalle = useFolioStore((s) => s.abrirDetalle);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const sinLeer = notificaciones.filter((n) => !n.leida).length;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getNotifIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return '🔴';
      case 'campana_pausada':
        return '⏸️';
      case 'info':
        return '🔵';
      default:
        return '📌';
    }
  };

  const getNotifColor = (tipo: string, leida: boolean) => {
    if (leida) return 'bg-white';
    switch (tipo) {
      case 'alerta':
        return 'bg-red-50 border-l-4 border-l-red-500';
      case 'campana_pausada':
        return 'bg-amber-50 border-l-4 border-l-amber-500';
      default:
        return 'bg-blue-50 border-l-4 border-l-blue-500';
    }
  };

  const formatTimeAgo = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `Hace ${days}d`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative w-9 h-9 rounded-xl bg-surface-100 hover:bg-surface-200 flex items-center justify-center transition-smooth cursor-pointer"
        title="Centro de Notificaciones"
      >
        <span className="text-base">🔔</span>
        {sinLeer > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center pulse-glow shadow-sm">
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden animate-scale-in z-50">
          {/* Header */}
          <div className="px-4 py-3 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <h3 className="text-sm font-semibold text-surface-800">Notificaciones</h3>
              {sinLeer > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                  {sinLeer} nuevas
                </span>
              )}
            </div>
            {sinLeer > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-[10px] text-primary-600 hover:text-primary-800 font-semibold cursor-pointer"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-100">
            {notificaciones.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl mb-2 block opacity-30">🔕</span>
                <p className="text-xs text-surface-400">Sin notificaciones</p>
              </div>
            ) : (
              notificaciones.slice(0, 20).map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 hover:bg-surface-50 transition-smooth cursor-pointer ${getNotifColor(
                    notif.tipo,
                    notif.leida
                  )}`}
                  onClick={() => {
                    marcarNotificacionLeida(notif.id);
                    abrirDetalle(notif.folioId);
                    setAbierto(false);
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5 shrink-0">{getNotifIcon(notif.tipo)}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-relaxed ${
                          notif.leida ? 'text-surface-500' : 'text-surface-800 font-medium'
                        }`}
                      >
                        {notif.mensaje}
                      </p>
                      <p className="text-[10px] text-surface-400 mt-1">
                        {formatTimeAgo(notif.fecha)}
                      </p>
                    </div>
                    {!notif.leida && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="px-4 py-2.5 bg-surface-50 border-t border-surface-200">
              <p className="text-[10px] text-surface-400 text-center">
                Mostrando {Math.min(notificaciones.length, 20)} de {notificaciones.length} notificaciones
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CentroNotificaciones;

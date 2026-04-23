import { type FC } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { usePermisos, useUsuarioActual } from '../hooks/usePermisos';
import { ROLES_CONFIG } from '../constants';
import type { VistaActiva } from '../types';

const allNavItems: { id: VistaActiva; label: string; icon: string }[] = [
  { id: 'kanban', label: 'Tablero Kanban', icon: '◫' },
  { id: 'dashboard', label: 'Dashboard', icon: '◩' },
  { id: 'agentes', label: 'Reporte de Agentes', icon: '◨' },
  { id: 'usuarios', label: 'Usuarios', icon: '⚙' },
];

const Sidebar: FC = () => {
  const vistaActiva = useFolioStore((s) => s.vistaActiva);
  const setVistaActiva = useFolioStore((s) => s.setVistaActiva);
  const abrirModal = useFolioStore((s) => s.abrirModal);
  const folios = useFolioStore((s) => s.folios);
  const permisos = usePermisos();
  const usuario = useUsuarioActual();

  const navItems = allNavItems.filter((item) => permisos.vistas.includes(item.id));

  const cerrados = folios.filter((f) => f.estado === 'cerrado').length;
  const activos = folios.filter((f) => f.estado !== 'cerrado').length;

  const rolConfig = usuario ? ROLES_CONFIG[usuario.rol] : null;

  return (
    <aside className="w-64 bg-surface-900 text-white flex flex-col min-h-screen shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Propify</h1>
            <p className="text-xs text-surface-400 font-medium">CRM Inmobiliario</p>
          </div>
        </div>
      </div>

      {/* Current User Role Badge */}
      {usuario && rolConfig && (
        <div className="px-4 pt-4">
          <div className="bg-surface-800/50 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rolConfig.bgColor} ${rolConfig.color} border ${rolConfig.borderColor}`}>
              {usuario.rol}
            </span>
            <span className="text-[10px] text-surface-400 truncate">{usuario.nombre}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs uppercase tracking-wider text-surface-500 font-semibold mb-3 px-3">
          Navegación
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => setVistaActiva(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth cursor-pointer ${
              vistaActiva === item.id
                ? 'bg-primary-600/20 text-primary-300 shadow-sm'
                : 'text-surface-300 hover:bg-surface-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Stats */}
      <div className="p-4 border-t border-surface-700/50">
        <div className="bg-surface-800/50 rounded-xl p-4 space-y-3">
          <p className="text-xs uppercase tracking-wider text-surface-500 font-semibold">
            Resumen
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-400">Total Folios</span>
            <span className="text-lg font-bold text-primary-400">{folios.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-400">Activos</span>
            <span className="text-lg font-bold text-emerald-400">{activos}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-400">Cerrados</span>
            <span className="text-lg font-bold text-amber-400">{cerrados}</span>
          </div>
        </div>
      </div>

      {/* Create Button - only if user has permission */}
      {permisos.puedeCrearFolio && (
        <div className="p-4">
          <button
            id="btn-crear-folio"
            onClick={abrirModal}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-primary-700 transition-smooth shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            Crear Nuevo Folio
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

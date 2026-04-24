import { type FC } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { usePermisos, useUsuarioActual } from '../hooks/usePermisos';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useUIStore } from '../store/useUIStore';
import type { VistaActiva } from '../types';

const allNavItems: { id: VistaActiva; label: string; icon: string }[] = [
  { id: 'kanban', label: 'Tablero Kanban', icon: '◫' },
  { id: 'dashboard', label: 'Dashboard', icon: '◩' },
  { id: 'agenda', label: 'Agenda', icon: '📅' },
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

  const rolesConfig = useUsuarioStore(s => s.rolesConfig);
  const rolConfig = usuario ? rolesConfig[usuario.rol] : null;

  const modoOscuro = useUIStore(s => s.modoOscuro);
  const toggleModoOscuro = useUIStore(s => s.toggleModoOscuro);
  const sidebarAbierto = useUIStore(s => s.sidebarAbierto);

  return (
    <aside className={`w-64 bg-zinc-900 text-white flex flex-col min-h-screen shadow-xl fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-zinc-700/50">
        <div className="flex items-center justify-center transition-opacity duration-300">
          <img src={modoOscuro ? "/propify2.png" : "/propify1.png"} alt="Propify Logo" className="h-10 w-auto" />
        </div>
      </div>

      {/* Current User Role Badge */}
      {usuario && rolConfig && (
        <div className="px-4 pt-4">
          <div className="bg-zinc-800/50 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rolConfig.bgColor} ${rolConfig.color} border ${rolConfig.borderColor}`}>
              {usuario.rol}
            </span>
            <span className="text-[10px] text-zinc-400 truncate">{usuario.nombre}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 px-3">
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
                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Stats */}
      <div className="p-4 border-t border-zinc-700/50">
        <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            Resumen
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Total Folios</span>
            <span className="text-lg font-bold text-primary-400">{folios.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Activos</span>
            <span className="text-lg font-bold text-emerald-400">{activos}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Cerrados</span>
            <span className="text-lg font-bold text-amber-400">{cerrados}</span>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="px-4 mt-auto pb-4 border-t border-zinc-700/50 pt-4 mt-6">
        <button
          onClick={toggleModoOscuro}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-smooth cursor-pointer border border-zinc-700/50 hover:border-zinc-600"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{modoOscuro ? '🌙' : '☀️'}</span>
            Modo Oscuro
          </span>
          <div className={`w-8 h-4 rounded-full transition-colors relative ${modoOscuro ? 'bg-primary-500' : 'bg-zinc-700'}`}>
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${modoOscuro ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </button>
      </div>

      {/* Create Button - only if user has permission */}
      {permisos.puedeCrearFolio && (
        <div className="p-4 pt-0">
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

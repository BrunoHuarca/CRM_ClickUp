import { type FC, useState } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { usePermisos, useUsuarioActual } from '../hooks/usePermisos';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useUIStore } from '../store/useUIStore';
import type { VistaActiva } from '../types';

const allNavItems: { id: VistaActiva; label: string; icon: string }[] = [
  { id: 'misfolios', label: 'Bandeja de Entrada', icon: '📋' },
  { id: 'kanban', label: 'Tablero Kanban', icon: '◫' },
  { id: 'agenda', label: 'Agenda', icon: '📅' },
  { id: 'miscompradores', label: 'Bandeja de Entrada', icon: '📥' },
  { id: 'kanbancompradores', label: 'Tablero Kanban', icon: '📊' },
  { id: 'agendacompradores', label: 'Agenda', icon: '🗓️' },
  { id: 'cartelerapropiedades', label: 'Cartera', icon: '🏢' },
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

  const cerrados = folios.filter((f) => f.estado === 'Publicado').length;
  const activos = folios.filter((f) => f.estado !== 'Publicado').length;

  const rolesConfig = useUsuarioStore(s => s.rolesConfig);
  const rolConfig = usuario ? rolesConfig[usuario.rol] : null;

  const modoOscuro = useUIStore(s => s.modoOscuro);
  const toggleModoOscuro = useUIStore(s => s.toggleModoOscuro);
  const sidebarAbierto = useUIStore(s => s.sidebarAbierto);
  const [propietariosAbierto, setPropietariosAbierto] = useState(false);
  const [compradoresAbierto, setCompradoresAbierto] = useState(false);

  return (
    <aside className={`w-64 bg-zinc-900 text-white flex flex-col min-h-screen shadow-xl fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-zinc-700/50">
        <div className="flex items-center justify-center transition-opacity duration-300">
          <img src={modoOscuro ? "/propify2.png" : "/propify2.png"} alt="Propify Logo" className="h-10 w-auto" />
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
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-none">
        
        {/* Grupo Propietarios (Desplegable) */}
        <div className="space-y-1">
          <button 
            onClick={() => setPropietariosAbierto(!propietariosAbierto)}
            className="w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold hover:text-zinc-300 transition-smooth group"
          >
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${propietariosAbierto ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-zinc-600'}`}></span>
              Propietarios
            </div>
            <span className={`text-[8px] transition-transform duration-300 ${propietariosAbierto ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          <div className={`space-y-1 overflow-hidden transition-all duration-300 ${propietariosAbierto ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
            {navItems.filter(i => ['misfolios', 'kanban', 'agenda'].includes(i.id)).map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setVistaActiva(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth cursor-pointer ml-2 border-l border-zinc-800 hover:border-zinc-700 ${
                  vistaActiva === item.id
                    ? 'bg-primary-600/10 text-primary-300 border-primary-500/50'
                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-white'
                }`}
              >
                <span className="text-base opacity-70">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grupo Compradores (Desplegable) */}
        <div className="space-y-1 mt-2">
          <button 
            onClick={() => setCompradoresAbierto(!compradoresAbierto)}
            className="w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold hover:text-zinc-300 transition-smooth group"
          >
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${compradoresAbierto ? 'bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-zinc-600'}`}></span>
              Compradores
            </div>
            <span className={`text-[8px] transition-transform duration-300 ${compradoresAbierto ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          <div className={`space-y-1 overflow-hidden transition-all duration-300 ${compradoresAbierto ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
            {navItems.filter(i => ['miscompradores', 'kanbancompradores', 'agendacompradores', 'cartelerapropiedades'].includes(i.id)).map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setVistaActiva(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth cursor-pointer ml-2 border-l border-zinc-800 hover:border-zinc-700 ${
                  vistaActiva === item.id
                    ? 'bg-primary-600/10 text-primary-300 border-primary-500/50'
                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-white'
                }`}
              >
                <span className="text-base opacity-70">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menús Normales */}
        <div className="space-y-1 pt-2">
          {navItems.filter(i => !['misfolios', 'kanban', 'agenda', 'miscompradores', 'kanbancompradores', 'agendacompradores', 'cartelerapropiedades'].includes(i.id)).map((item) => (
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
        </div>
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

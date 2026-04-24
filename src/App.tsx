import { type FC, useEffect } from 'react';
import { useFolioStore } from './store/useFolioStore';
import { useUsuarioStore } from './store/useUsuarioStore';
import { usePermisos } from './hooks/usePermisos';
import { useUIStore } from './store/useUIStore';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import AgendaVisitas from './components/AgendaVisitas';
import ReporteAgentes from './components/ReporteAgentes';
import ConfigUsuarios from './components/ConfigUsuarios';
import CrearFolioModal from './components/CrearFolioModal';
import FolioDetailModal from './components/FolioDetailModal';
import CentroNotificaciones from './components/CentroNotificaciones';
import SelectorUsuario from './components/SelectorUsuario';
import AccesoRestringido from './components/AccesoRestringido';

const VISTA_CONFIG: Record<string, { label: string; icon: string }> = {
  kanban: { label: 'Tablero Kanban', icon: '◫' },
  dashboard: { label: 'Dashboard', icon: '◩' },
  agenda: { label: 'Agenda de Visitas', icon: '📅' },
  agentes: { label: 'Reporte de Agentes', icon: '◨' },
  usuarios: { label: 'Configuración de Usuarios', icon: '⚙' },
};

const App: FC = () => {
  const vistaActiva = useFolioStore((s) => s.vistaActiva);
  const inicializar = useFolioStore((s) => s.inicializar);
  const generarNotificaciones = useFolioStore((s) => s.generarNotificaciones);
  const inicializarUsuarios = useUsuarioStore((s) => s.inicializar);
  const permisos = usePermisos();
  const modoOscuro = useUIStore((s) => s.modoOscuro);
  const sidebarAbierto = useUIStore((s) => s.sidebarAbierto);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarAbierto = useUIStore((s) => s.setSidebarAbierto);

  useEffect(() => {
    inicializarUsuarios();
    inicializar();
  }, [inicializar, inicializarUsuarios]);

  useEffect(() => {
    if (modoOscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [modoOscuro]);

  useEffect(() => {
    const timeout = setTimeout(() => generarNotificaciones(), 500);
    const interval = setInterval(() => generarNotificaciones(), 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [generarNotificaciones]);

  const vistaInfo = VISTA_CONFIG[vistaActiva] || VISTA_CONFIG.kanban;
  const tieneAcceso = permisos.vistas.includes(vistaActiva);

  const renderVista = () => {
    if (!tieneAcceso) {
      return <AccesoRestringido />;
    }
    switch (vistaActiva) {
      case 'kanban':
        return <KanbanBoard />;
      case 'dashboard':
        return <Dashboard />;
      case 'agenda':
        return <AgendaVisitas />;
      case 'agentes':
        return <ReporteAgentes />;
      case 'usuarios':
        return <ConfigUsuarios />;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-100 text-surface-800 transition-colors duration-300">
      {/* Mobile Overlay */}
      {sidebarAbierto && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarAbierto(false)}
        />
      )}
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-surface-200 px-6 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="md:hidden w-8 h-8 rounded-lg bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-smooth"
            >
              ☰
            </button>
            <div className="hidden md:flex w-8 h-8 rounded-lg bg-surface-100 items-center justify-center">
              <span className="text-surface-500 text-sm">{vistaInfo.icon}</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-surface-800">{vistaInfo.label}</h1>
              <p className="text-[11px] text-surface-400">
                {new Date().toLocaleDateString('es-PE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CentroNotificaciones />
            {permisos.puedeCrearFolio && (
              <button
                onClick={() => useFolioStore.getState().abrirModal()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-smooth shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-base">+</span> Nuevo Folio
              </button>
            )}
            <SelectorUsuario />
          </div>
        </header>

        {/* Vista Content */}
        <div className="h-[calc(100vh-57px)] overflow-auto">
          {renderVista()}
        </div>
      </main>
      <CrearFolioModal />
      <FolioDetailModal />
    </div>
  );
};

export default App;

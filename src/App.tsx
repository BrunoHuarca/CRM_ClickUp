import { type FC, useEffect } from 'react';
import { useFolioStore } from './store/useFolioStore';
import { useUsuarioStore } from './store/useUsuarioStore';
import { usePermisos } from './hooks/usePermisos';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
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
  agentes: { label: 'Reporte de Agentes', icon: '◨' },
  usuarios: { label: 'Configuración de Usuarios', icon: '⚙' },
};

const App: FC = () => {
  const vistaActiva = useFolioStore((s) => s.vistaActiva);
  const inicializar = useFolioStore((s) => s.inicializar);
  const generarNotificaciones = useFolioStore((s) => s.generarNotificaciones);
  const inicializarUsuarios = useUsuarioStore((s) => s.inicializar);
  const permisos = usePermisos();

  useEffect(() => {
    inicializarUsuarios();
    inicializar();
  }, [inicializar, inicializarUsuarios]);

  // Generate notifications on mount and every 60 seconds
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
      case 'agentes':
        return <ReporteAgentes />;
      case 'usuarios':
        return <ConfigUsuarios />;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-100">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-surface-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
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

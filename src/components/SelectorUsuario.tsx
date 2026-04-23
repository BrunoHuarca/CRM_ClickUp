import { type FC, useState, useRef, useEffect } from 'react';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { ROLES_CONFIG, AVATAR_GRADIENTS } from '../constants';

const SelectorUsuario: FC = () => {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);
  const setUsuarioActual = useUsuarioStore((s) => s.setUsuarioActual);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const usuarioActual = usuarios.find((u) => u.id === usuarioActualId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!usuarioActual) return null;

  const gradient = AVATAR_GRADIENTS[usuarioActual.color] || AVATAR_GRADIENTS.purple;
  const rolConfig = ROLES_CONFIG[usuarioActual.rol];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-surface-100 transition-smooth cursor-pointer"
      >
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <span className="text-white font-bold text-sm">{usuarioActual.avatar}</span>
        </div>
        <div className="text-left hidden md:block">
          <p className="text-xs font-semibold text-surface-700 leading-tight">{usuarioActual.nombre.split(' ')[0]}</p>
          <p className={`text-[9px] font-bold ${rolConfig?.color || 'text-surface-500'}`}>{usuarioActual.rol}</p>
        </div>
        <span className="text-[10px] text-surface-400 ml-0.5">▼</span>
      </button>

      {abierto && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden animate-scale-in z-50">
          <div className="px-4 py-3 bg-surface-50 border-b border-surface-200">
            <p className="text-[10px] text-surface-500 uppercase font-semibold tracking-wider">
              Cambiar Usuario
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {usuarios.filter((u) => u.activo).map((usuario) => {
              const isActive = usuario.id === usuarioActualId;
              const grad = AVATAR_GRADIENTS[usuario.color] || AVATAR_GRADIENTS.purple;
              const rc = ROLES_CONFIG[usuario.rol];

              return (
                <button
                  key={usuario.id}
                  onClick={() => {
                    setUsuarioActual(usuario.id);
                    setAbierto(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-50 transition-smooth cursor-pointer ${
                    isActive ? 'bg-primary-50 border-l-3 border-l-primary-500' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm shrink-0`}>
                    <span className="text-white font-bold text-[11px]">{usuario.avatar}</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-semibold text-surface-700 truncate">{usuario.nombre}</p>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${rc?.bgColor} ${rc?.color} border ${rc?.borderColor}`}>
                      {usuario.rol}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorUsuario;

import { type FC } from 'react';
import { useUsuarioActual } from '../hooks/usePermisos';
import { useUsuarioStore } from '../store/useUsuarioStore';

const AccesoRestringido: FC<{ mensaje?: string }> = ({ mensaje }) => {
  const usuario = useUsuarioActual();
  const rolesConfig = useUsuarioStore((s) => s.rolesConfig);
  const rolConfig = usuario ? rolesConfig[usuario.rol] : null;

  return (
    <div className="flex-1 flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>
        <h2 className="text-xl font-bold text-surface-800 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-surface-500 mb-4">
          {mensaje || 'No tienes permisos para acceder a esta sección.'}
        </p>
        {usuario && rolConfig && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 border border-surface-200">
            <span className="text-xs text-surface-400">Tu rol actual:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rolConfig.bgColor} ${rolConfig.color} border ${rolConfig.borderColor}`}>
              {usuario.rol}
            </span>
          </div>
        )}
        <p className="text-xs text-surface-400 mt-4">
          Contacta al administrador para solicitar acceso.
        </p>
      </div>
    </div>
  );
};

export default AccesoRestringido;

import { type FC, type FormEvent, useState } from 'react';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { ROLES_CONFIG, AVATAR_GRADIENTS, PERMISOS_POR_ROL } from '../constants';
import type { RolUsuario } from '../types';
import { usePermisos } from '../hooks/usePermisos';
import AccesoRestringido from './AccesoRestringido';

const ROLES: RolUsuario[] = ['Admin', 'Comercial', 'Call Center', 'Legal'];
const COLORES = Object.keys(AVATAR_GRADIENTS);

const ConfigUsuarios: FC = () => {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const agregarUsuario = useUsuarioStore((s) => s.agregarUsuario);
  const eliminarUsuario = useUsuarioStore((s) => s.eliminarUsuario);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);
  const permisos = usePermisos();

  const [formAbierto, setFormAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<RolUsuario>('Comercial');
  const [color, setColor] = useState('blue');

  if (!permisos.puedeCrearUsuarios) {
    return <AccesoRestringido mensaje="Solo los administradores pueden gestionar usuarios." />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const partes = nombre.trim().split(' ');
    const avatar = partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`.toUpperCase()
      : nombre.trim().slice(0, 2).toUpperCase();

    agregarUsuario({ nombre: nombre.trim(), rol, avatar, color });
    setFormAbierto(false);
    setNombre('');
    setRol('Comercial');
    setColor('blue');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-surface-800">Configuración de Usuarios</h2>
        <p className="text-sm text-surface-500 mt-1">
          Gestiona los usuarios del sistema y sus roles de acceso
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {ROLES.map((r) => {
          const config = ROLES_CONFIG[r];
          const count = usuarios.filter((u) => u.rol === r && u.activo).length;
          return (
            <div key={r} className="bg-white rounded-2xl shadow-sm border border-surface-200 p-4 animate-slide-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">{r}</p>
                  <p className="text-2xl font-bold text-surface-800 mt-1">{count}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center border ${config.borderColor}`}>
                  <span className={`text-sm font-bold ${config.color}`}>
                    {r === 'Admin' ? '👑' : r === 'Comercial' ? '💼' : r === 'Call Center' ? '📞' : '⚖️'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User + Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden animate-slide-in">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-surface-800">Usuarios del Sistema</h3>
            <p className="text-xs text-surface-400">{usuarios.filter((u) => u.activo).length} usuarios activos</p>
          </div>
          <button
            onClick={() => setFormAbierto(!formAbierto)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-smooth cursor-pointer flex items-center gap-1.5"
          >
            {formAbierto ? '✕ Cancelar' : '+ Nuevo Usuario'}
          </button>
        </div>

        {/* Create Form */}
        {formAbierto && (
          <form onSubmit={handleSubmit} className="p-6 bg-surface-50 border-b border-surface-200 animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre y Apellido"
                  required
                  className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                  Rol
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1">
                  Color Avatar
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[c]} cursor-pointer transition-all ${
                        color === c ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-semibold transition-smooth cursor-pointer"
                >
                  Crear Usuario
                </button>
              </div>
            </div>

            {/* Permissions preview */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-surface-200">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-2">
                Permisos del rol "{rol}"
              </p>
              <div className="flex flex-wrap gap-2">
                {PERMISOS_POR_ROL[rol]?.vistas.map((v) => (
                  <span key={v} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                    ✓ {v === 'kanban' ? 'Kanban' : v === 'dashboard' ? 'Dashboard' : v === 'agentes' ? 'Agentes' : 'Usuarios'}
                  </span>
                ))}
                {!PERMISOS_POR_ROL[rol]?.puedeCrearFolio && (
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium border border-red-200">
                    ✕ Crear Folios
                  </span>
                )}
                {!PERMISOS_POR_ROL[rol]?.puedeMoverFolio && (
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium border border-red-200">
                    ✕ Mover Folios
                  </span>
                )}
                {!PERMISOS_POR_ROL[rol]?.puedeEliminarCosto && (
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium border border-red-200">
                    ✕ Eliminar Costos
                  </span>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-6 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Usuario</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Rol</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Vistas</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Permisos</th>
                <th className="text-center px-4 py-3 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {usuarios.filter((u) => u.activo).map((usuario) => {
                const grad = AVATAR_GRADIENTS[usuario.color] || AVATAR_GRADIENTS.purple;
                const rc = ROLES_CONFIG[usuario.rol];
                const perms = PERMISOS_POR_ROL[usuario.rol];
                const isCurrentUser = usuario.id === usuarioActualId;

                return (
                  <tr key={usuario.id} className={`hover:bg-surface-50 transition-smooth ${isCurrentUser ? 'bg-primary-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center shadow-md shrink-0`}>
                          <span className="text-white font-bold text-[11px]">{usuario.avatar}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-surface-800">{usuario.nombre}</p>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary-100 text-primary-700 border border-primary-200">
                                TÚ
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-surface-400 font-mono">ID: {usuario.id.slice(0, 10)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${rc?.bgColor} ${rc?.color} border ${rc?.borderColor}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {perms?.vistas.map((v) => (
                          <span key={v} className="px-1.5 py-0.5 rounded text-[9px] bg-surface-100 text-surface-600 font-medium">
                            {v === 'kanban' ? '◫' : v === 'dashboard' ? '◩' : v === 'agentes' ? '◨' : '⚙'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {perms?.puedeCrearFolio && <span className="px-1 py-0.5 text-[8px] rounded bg-emerald-50 text-emerald-600 font-semibold">Crear</span>}
                        {perms?.puedeMoverFolio && <span className="px-1 py-0.5 text-[8px] rounded bg-blue-50 text-blue-600 font-semibold">Mover</span>}
                        {perms?.puedeEliminarCosto && <span className="px-1 py-0.5 text-[8px] rounded bg-amber-50 text-amber-600 font-semibold">Del.Costos</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {!isCurrentUser && (
                        <button
                          onClick={() => eliminarUsuario(usuario.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 text-xs transition-smooth cursor-pointer mx-auto"
                          title="Eliminar usuario"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfigUsuarios;

import { type FC, type FormEvent, useState } from 'react';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { AVATAR_GRADIENTS } from '../constants';
import type { RolUsuario, VistaActiva } from '../types';

const COLORES = Object.keys(AVATAR_GRADIENTS);

const ConfigUsuarios: FC = () => {
  const usuarios = useUsuarioStore((s) => s.usuarios);
  const rolesConfig = useUsuarioStore((s) => s.rolesConfig);
  const permisosRoles = useUsuarioStore((s) => s.permisosRoles);
  const agregarUsuario = useUsuarioStore((s) => s.agregarUsuario);
  const eliminarUsuario = useUsuarioStore((s) => s.eliminarUsuario);
  const usuarioActualId = useUsuarioStore((s) => s.usuarioActualId);
  const guardarRol = useUsuarioStore((s) => s.guardarRol);
  const eliminarRol = useUsuarioStore((s) => s.eliminarRol);

  const [formAbierto, setFormAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<RolUsuario>('Comercial');
  const [color, setColor] = useState('blue');

  // Estado para nuevo Rol
  const [rolEnEdicion, setRolEnEdicion] = useState<string | null>(null);
  const [formRolAbierto, setFormRolAbierto] = useState(false);
  const [nuevoRol, setNuevoRol] = useState('');
  const [colorRol, setColorRol] = useState('emerald');
  const [vistasSeleccionadas, setVistasSeleccionadas] = useState<VistaActiva[]>(['kanban']);
  const [crearF, setCrearF] = useState(false);
  const [moverF, setMoverF] = useState(false);
  const [eliminarCos, setEliminarCos] = useState(false);
  const [verRent, setVerRent] = useState(false);

  const usuarioActual = useUsuarioStore((s) => s.getUsuarioActual());
  const lsRoles = Object.keys(rolesConfig);

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
    setRol(lsRoles[0]);
    setColor('blue');
  };

  const handleCrearRol = (e: FormEvent) => {
    e.preventDefault();
    if (!nuevoRol.trim()) return;

    guardarRol(
      nuevoRol.trim(),
      {
        label: nuevoRol.trim(),
        color: `text-${colorRol}-700`,
        bgColor: `bg-${colorRol}-100`,
        borderColor: `border-${colorRol}-200`,
      },
      {
        vistas: vistasSeleccionadas,
        etapasVisibles: ['captacion', 'legal', 'marketing', 'venta', 'cerrado'],
        puedeCrearFolio: crearF,
        puedeMoverFolio: moverF,
        puedeEliminarCosto: eliminarCos,
        puedeVerRentabilidad: verRent,
        puedeCrearUsuarios: false,
      }
    );
    setFormRolAbierto(false);
    setNuevoRol('');
    setVistasSeleccionadas(['kanban']);
    setCrearF(false); setMoverF(false); setEliminarCos(false); setVerRent(false);
    setRolEnEdicion(null);
  };

  const handleEditarRol = (rolId: string) => {
    const rConfig = rolesConfig[rolId];
    const pRoles = permisosRoles[rolId];
    if (!rConfig || !pRoles) return;
    
    // Parse color name from bgColor e.g "bg-blue-100" -> "blue"
    const colorKey = Object.keys(AVATAR_GRADIENTS).find(c => rConfig.bgColor.includes(c)) || 'blue';
    
    setRolEnEdicion(rolId);
    setNuevoRol(rolId);
    setColorRol(colorKey);
    setVistasSeleccionadas(pRoles.vistas as VistaActiva[]);
    setCrearF(pRoles.puedeCrearFolio);
    setMoverF(pRoles.puedeMoverFolio);
    setEliminarCos(pRoles.puedeEliminarCosto);
    setVerRent(pRoles.puedeVerRentabilidad || false);
    
    setFormRolAbierto(true);
  };

  const toggleVista = (v: VistaActiva) => {
    setVistasSeleccionadas(prev => 
      prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]
    );
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
        {lsRoles.map((r) => {
          const config = rolesConfig[r];
          if (!config) return null;
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
          {usuarioActual?.rol === 'Admin' && (
            <button
              onClick={() => setFormAbierto(!formAbierto)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-smooth cursor-pointer flex items-center gap-1.5"
            >
              {formAbierto ? '✕ Cancelar' : '+ Nuevo Usuario'}
            </button>
          )}
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
                  {lsRoles.map((r) => (
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
                {permisosRoles[rol]?.vistas.map((v) => (
                  <span key={v} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                    ✓ {v === 'kanban' ? 'Kanban' : v === 'dashboard' ? 'Dashboard' : v === 'agentes' ? 'Agentes' : 'Usuarios'}
                  </span>
                ))}
                {!permisosRoles[rol]?.puedeCrearFolio && (
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium border border-red-200">
                    ✕ Crear Folios
                  </span>
                )}
                {!permisosRoles[rol]?.puedeMoverFolio && (
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium border border-red-200">
                    ✕ Mover Folios
                  </span>
                )}
                {!permisosRoles[rol]?.puedeEliminarCosto && (
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
                const rc = rolesConfig[usuario.rol];
                const perms = permisosRoles[usuario.rol];
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
                      {!isCurrentUser && usuarioActual?.rol === 'Admin' && (
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

      {/* Role Management Module */}
      {usuarioActual?.rol === 'Admin' && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden animate-slide-in">
          <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-surface-800">Gestión de Roles</h3>
              <p className="text-xs text-surface-400">Crea y administra permisos de seguridad granulares</p>
            </div>
            <button
              onClick={() => {
                setFormRolAbierto(!formRolAbierto);
                if (formRolAbierto) setRolEnEdicion(null); // Clear formatting if closed
                if (!formRolAbierto) {
                  setNuevoRol('');
                  setRolEnEdicion(null);
                }
              }}
              className="bg-surface-800 hover:bg-surface-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-smooth flex items-center gap-1.5"
            >
              {formRolAbierto ? '✕ Cancelar' : '+ Crear Rol Personalizado'}
            </button>
          </div>

          {formRolAbierto && (
            <form onSubmit={handleCrearRol} className="p-6 bg-surface-50 border-b border-surface-200 animate-scale-in">
              <div className="mb-4">
                <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {rolEnEdicion ? '✏️ Editando Rol Existente' : '✨ Creando Nuevo Rol'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-2">Nombre del Rol *</label>
                  <input
                    type="text"
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                    placeholder="Ej. Auditor, Contabilidad..."
                    required
                    disabled={!!rolEnEdicion}
                    className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-surface-500 disabled:opacity-50 disabled:bg-surface-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-2">Color Distintivo</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {COLORES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorRol(c)}
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[c]} cursor-pointer transition-all ${
                          colorRol === c ? 'ring-2 ring-surface-800 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-surface-700 mb-3 border-b border-surface-200 pb-2">Vistas Permitidas</h4>
                  <div className="space-y-2">
                    {(['kanban', 'dashboard', 'agentes', 'agenda', 'usuarios'] as VistaActiva[]).map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vistasSeleccionadas.includes(v)}
                          onChange={() => toggleVista(v)}
                          className="w-4 h-4 rounded text-surface-800 focus:ring-surface-800"
                        />
                        <span className="text-sm font-medium text-surface-600 capitalize">{v === 'usuarios' ? 'Configuración Usuarios' : v}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-surface-700 mb-3 border-b border-surface-200 pb-2">Acciones Permitidas</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={crearF} onChange={e => setCrearF(e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm font-medium text-surface-600">Crear nuevos folios</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={moverF} onChange={e => setMoverF(e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm font-medium text-surface-600">Mover folios (Avanzar/Retroceder)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={eliminarCos} onChange={e => setEliminarCos(e.target.checked)} className="w-4 h-4 rounded flex-shrink-0 text-red-500 focus:ring-red-500" />
                      <span className="text-sm font-medium text-surface-600">Eliminar costos sensibles</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button type="submit" className="bg-surface-800 hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-smooth">Guardar Rol</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto p-4 bg-surface-50">
             <div className="flex flex-wrap gap-3">
               {lsRoles.map((rolId) => {
                 const conf = rolesConfig[rolId];
                 return (
                   <div key={rolId} className="w-64 bg-white border border-surface-200 p-4 rounded-xl shadow-sm relative group">
                     {usuarioActual?.rol === 'Admin' && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleEditarRol(rolId)} className="w-6 h-6 rounded bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center text-xs font-bold" title="Editar Rol">✏️</button>
                          {rolId !== 'Admin' && (
                            <button onClick={() => eliminarRol(rolId)} className="w-6 h-6 rounded bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs font-bold" title="Eliminar Rol">✕</button>
                          )}
                        </div>
                     )}
                     <div className={`inline-block px-2 py-1 ${conf?.bgColor} ${conf?.color} border ${conf?.borderColor} rounded mb-2 text-xs font-bold`}>{rolId} {rolId === 'Admin' && '👑'}</div>
                     <p className="text-[10px] text-surface-400 font-mono mb-2">Permisos: {permisosRoles[rolId]?.vistas.length} Vistas</p>
                   </div>
                 )
               })}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigUsuarios;

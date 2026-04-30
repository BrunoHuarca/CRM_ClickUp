import { type FC, useState, useMemo } from 'react';
import { useFolioStore } from '../store/useFolioStore';
import { TIPOS_INMUEBLE } from '../constants';

const CarteleraPropiedades: FC = () => {
  const folios = useFolioStore((s) => s.folios);
  const abrirDetalleFolio = useFolioStore((s) => s.abrirDetalle);
  
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  const propiedadesPublicadas = useMemo(() => {
    return folios.filter((f) => f.estado === 'Publicado' && (filtroTipo === 'Todos' || f.tipoInmueble === filtroTipo));
  }, [folios, filtroTipo]);

  return (
    <div className="flex flex-col h-full bg-surface-100 flex-1 overflow-x-auto p-6 animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-800">Cartelera de Propiedades</h2>
          <p className="text-sm text-surface-500 mt-1">
            Explora las propiedades disponibles con estado Publicado.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-surface-200">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-surface-500 uppercase mb-1">Filtrar por Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary-500 transition-smooth min-w-[150px]"
            >
              <option value="Todos">Todos los tipos</option>
              {TIPOS_INMUEBLE.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propiedadesPublicadas.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-surface-300 text-center">
            <p className="text-surface-500 font-medium">No hay propiedades publicadas en este momento.</p>
          </div>
        ) : (
          propiedadesPublicadas.map((folio) => {
            return (
              <div 
                key={folio.id} 
                onClick={() => abrirDetalleFolio(folio.id, true)}
                className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-surface-100">
                  {folio.multimediaUrls && folio.multimediaUrls.length > 0 ? (
                    <img src={folio.multimediaUrls[0]} alt={folio.tipoInmueble} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-300 text-4xl">🏠</div>
                  )}
                  <div className={`absolute top-3 left-3 ${folio.compradorAsignadoId ? 'bg-amber-600' : 'bg-emerald-500'} text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg`}>
                    {folio.compradorAsignadoId ? 'RESERVADO' : 'PUBLICADO'}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20">
                    {folio.tipoInmueble}
                  </div>
                  
                  {folio.compradorAsignadoId && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                      <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl border border-white/30 flex items-center gap-1.5 animate-pulse">
                        <span>🔒</span> RESERVADO
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-surface-800 leading-tight group-hover:text-primary-600 transition-smooth">
                      {folio.propietarioNombre}
                    </h3>
                    <span className="text-emerald-600 font-bold text-sm">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(folio.precioEsperado || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-surface-500 mb-4">
                    <span className="bg-surface-100 px-2 py-0.5 rounded border border-surface-200 font-mono">{folio.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>{new Date(folio.fechaCreacion).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-surface-100 flex items-center justify-between text-xs font-medium text-surface-400 group-hover:text-primary-500 transition-smooth">
                    <span>Ver ficha completa</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CarteleraPropiedades;

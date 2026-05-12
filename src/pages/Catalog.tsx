import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import ProductCard from '../components/product/ProductCard';
import { Search } from 'lucide-react';

export default function Catalog() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({ search, category, page, limit: 20 });
  const { data: categories = [] } = useCategories();

  return (
    <>
      <Helmet>
        <title>Productos — KAP Equipamiento Comercial</title>
        <meta name="description" content="Catálogo de productos KAP: maniquíes, percheros, mostradores y más." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Productos</h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar... (Enter)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { setSearch(inputValue); setPage(1); }
              }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-56"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {data?.data.length === 0 && (
              <p className="text-center text-gray-400 py-16">Sin resultados para tu búsqueda.</p>
            )}
            {data && data.total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40">Anterior</button>
                <span className="px-4 py-2 text-sm text-gray-600">Página {page} de {Math.ceil(data.total / 20)}</span>
                <button disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40">Siguiente</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

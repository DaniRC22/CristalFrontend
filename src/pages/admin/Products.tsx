import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import api from '../../lib/api';
import type { Product } from '../../types';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Product[]; total: number }>({
    queryKey: ['admin-products', search, page],
    queryFn: () => api.get('/api/admin/products', { params: { search, page, limit: 20 } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Eliminar "${name}"?`)) deleteMutation.mutate(id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link to="/admin/productos/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          <Plus size={18} /> Nuevo producto
        </Link>
      </div>

      <div className="relative mb-4 w-72">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Buscar..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-500">
              <tr className="text-left">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((p) => {
                const img = p.product_images?.find((i) => i.is_primary) ?? p.product_images?.[0];
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {img && <img src={img.thumb_url ?? img.url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.categories?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">${Number(p.price).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= p.low_stock_threshold ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/productos/${p.id}`} className="p-1.5 text-gray-400 hover:text-blue-600"><Pencil size={16} /></Link>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!data?.data.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin productos</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Anterior</button>
          <button disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">Siguiente</button>
        </div>
      )}
    </div>
  );
}

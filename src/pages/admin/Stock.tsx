import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

type StockStatus = 'out' | 'low' | 'ok';

interface StockItem {
  id: number;
  name: string;
  stock: number;
  low_stock_threshold: number;
  status: StockStatus;
  categories?: { name: string };
}

const statusLabel: Record<StockStatus, { label: string; className: string; dot: string }> = {
  out: { label: 'Sin stock', className: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  low: { label: 'Stock bajo', className: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  ok: { label: 'OK', className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

export default function AdminStock() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState<Record<number, number>>({});
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<StockItem[]>({
    queryKey: ['admin-stock', filter, search],
    queryFn: () => api.get('/api/admin/stock', { params: { filter: filter || undefined, search: search || undefined } }).then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      api.patch(`/api/admin/stock/${id}`, { stock }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stock'] }),
  });

  const handleSave = (id: number) => {
    if (edits[id] !== undefined) {
      mutation.mutate({ id, stock: edits[id] });
      setEdits((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Control de Stock</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
        />
        <div className="flex gap-2">
          {[['', 'Todos'], ['out', 'Sin stock'], ['low', 'Stock bajo']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${filter === val ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Umbral</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const s = statusLabel[item.status];
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.categories?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={edits[item.id] ?? item.stock}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.low_stock_threshold}</td>
                    <td className="px-4 py-3">
                      {edits[item.id] !== undefined && (
                        <button
                          onClick={() => handleSave(item.id)}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                        >
                          Guardar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

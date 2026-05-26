import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import api from '../../lib/api';
import type { Order } from '../../types';

const statusConfig = {
  approved: { label: 'Aprobada', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
};

const paymentConfig: Record<string, string> = {
  mercadopago: 'MercadoPago',
  mercado_credito: 'Mercado Crédito',
  transfer: 'Transferencia',
  presencial: 'Efectivo',
};

const today = () => new Date().toISOString().slice(0, 10);

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<{ data: Order[]; total: number }>({
    queryKey: ['admin-orders', status, date, page],
    queryFn: () =>
      api.get('/api/admin/orders', {
        params: { status: status || undefined, date: date || undefined, page, limit: 20 },
      }).then((r) => r.data),
    staleTime: 0,
  });

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta orden cancelada?')) return;
    await api.delete(`/api/admin/orders/${id}`);
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Órdenes</h1>

      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="flex gap-2">
          {[['', 'Todas'], ['pending', 'Pendientes'], ['approved', 'Aprobadas'], ['cancelled', 'Canceladas']].map(([val, label]) => (
            <button key={val} onClick={() => { setStatus(val); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${status === val ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600"
          />
          {date && (
            <button onClick={() => { setDate(''); setPage(1); }} className="text-xs text-gray-400 hover:text-gray-600">✕ Limpiar</button>
          )}
          <button onClick={() => setDate(today())} className="text-xs text-blue-600 hover:underline">Hoy</button>
          <button onClick={() => refetch()} className="text-xs text-blue-600 hover:underline">↻ Actualizar</button>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Cargando...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.data ?? []).map((order) => {
                const s = statusConfig[order.status] ?? statusConfig.pending;
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-gray-400">#{order.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">${Number(order.total).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{paymentConfig[order.payment_method ?? ''] ?? order.payment_method ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Link to={`/admin/ordenes/${order.id}`} className="text-xs text-blue-600 hover:underline">Ver</Link>
                      {order.status === 'cancelled' && (
                        <button onClick={() => handleDelete(order.id)} className="text-red-400 hover:text-red-600" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!data?.data?.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Sin órdenes</td></tr>}
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

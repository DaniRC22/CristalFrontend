import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingBag, AlertTriangle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import type { Order, StockItem } from '../../types';

export default function AdminDashboard() {
  const { data: stockItems = [] } = useQuery<StockItem[]>({
    queryKey: ['admin-stock'],
    queryFn: () => api.get('/api/admin/stock').then((r) => r.data),
  });

  const { data: orders } = useQuery<{ data: Order[]; total: number }>({
    queryKey: ['admin-orders-recent'],
    queryFn: () => api.get('/api/admin/orders', { params: { limit: 5 } }).then((r) => r.data),
  });

  const outOfStock = stockItems.filter((p) => p.status === 'out').length;
  const lowStock = stockItems.filter((p) => p.status === 'low').length;

  const stats = [
    { label: 'Productos en catálogo', value: stockItems.length, icon: Package, color: 'blue' },
    { label: 'Sin stock', value: outOfStock, icon: XCircle, color: 'red' },
    { label: 'Stock bajo', value: lowStock, icon: AlertTriangle, color: 'yellow' },
    { label: 'Órdenes totales', value: orders?.total ?? 0, icon: ShoppingBag, color: 'green' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${color}-100`}>
              <Icon size={22} className={`text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Órdenes recientes</h2>
        {!orders?.data?.length ? (
          <p className="text-sm text-gray-400">Sin órdenes aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">#</th>
                <th className="pb-2">Cliente</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.data.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 text-gray-400">#{order.id}</td>
                  <td className="py-2">{order.customer_name}</td>
                  <td className="py-2 font-medium">${Number(order.total).toLocaleString('es-AR')}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'approved' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'approved' ? 'Aprobada' : order.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-2 text-gray-400">{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

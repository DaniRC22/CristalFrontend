import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import type { Order } from '../../types';

const paymentLabels: Record<string, string> = {
  transfer: 'Transferencia bancaria',
  presencial: 'Pago en persona',
  mercadopago: 'Medio de pago a elección (MP)',
  mercado_credito: 'Mercado Crédito',
};

const shippingLabels: Record<string, string> = {
  retiro: 'Retiro en el local',
  flete: 'Flete',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4">
      <p className="text-xs font-medium text-gray-400 uppercase mb-3">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm mb-1">
      <span className="text-gray-400 min-w-28 shrink-0">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['admin-order', id],
    queryFn: () => api.get(`/api/admin/orders/${id}`).then((r) => r.data),
    staleTime: 0,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/api/admin/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-order', id] }),
  });

  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const verifyMutation = useMutation({
    mutationFn: () => api.post(`/api/admin/orders/${id}/verify-payment`).then((r) => r.data as { updated: boolean; reason?: string; payment_status?: string }),
    onSuccess: (data) => {
      if (data.updated) {
        queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        setVerifyMsg('Estado actualizado correctamente.');
      } else {
        setVerifyMsg(data.reason ?? 'Sin cambios.');
      }
    },
    onError: () => setVerifyMsg('Error al verificar el pago.'),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Cargando...</div>;
  if (!order) return <div className="p-6 text-sm text-gray-400">Orden no encontrada.</div>;

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
    { value: 'approved', label: 'Aprobada', className: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelada', className: 'bg-red-100 text-red-700' },
  ];

  const current = statusOptions.find((s) => s.value === order.status) ?? statusOptions[0];

  const fullAddress = [order.address, order.address2, order.city, order.province, order.postal_code]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate('/admin/ordenes')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orden #{order.id}</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('es-AR')}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${current.className}`}>{current.label}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

        {/* Cliente */}
        <Section title="Cliente">
          <Row label="Nombre" value={order.customer_name} />
          <Row label="Email" value={order.customer_email} />
          <Row label="Teléfono" value={order.customer_phone} />
        </Section>

        {/* Dirección */}
        {fullAddress && (
          <Section title="Dirección">
            <Row label="Dirección" value={order.address} />
            {order.address2 && <Row label="Piso / Dpto" value={order.address2} />}
            <Row label="Ciudad" value={order.city} />
            <Row label="Provincia" value={order.province} />
            <Row label="Cód. postal" value={order.postal_code} />
          </Section>
        )}

        {/* Envío y pago */}
        <Section title="Logística y pago">
          <Row label="Método de envío" value={order.shipping_method ? (shippingLabels[order.shipping_method] ?? order.shipping_method) : undefined} />
          <Row label="Método de pago" value={order.payment_method ? (paymentLabels[order.payment_method] ?? order.payment_method) : undefined} />
          {order.mp_payment_id && <Row label="ID pago MP" value={order.mp_payment_id} />}
        </Section>

        {/* Productos */}
        {order.order_items && (
          <Section title="Productos">
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm gap-4">
                  <div>
                    <span className="text-gray-700">{item.products?.name ?? 'Producto eliminado'} × {item.quantity}</span>
                    {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {Object.entries(item.selected_options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="font-medium shrink-0">${Number(item.unit_price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-2 mt-3 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span>${Number(order.total).toLocaleString('es-AR')}</span>
            </div>
          </Section>
        )}

        {/* Cambiar estado */}
        <Section title="Cambiar estado">
          <div className="flex flex-wrap gap-2 items-center">
            {statusOptions.map((s) => (
              <button key={s.value} onClick={() => statusMutation.mutate(s.value)} disabled={s.value === order.status || statusMutation.isPending}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-40 ${s.value === order.status ? `${s.className} border-transparent` : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                {s.label}
              </button>
            ))}
            {order.status === 'pending' && ['mercadopago', 'mercado_credito'].includes(order.payment_method ?? '') && (
              <button
                onClick={() => { setVerifyMsg(null); verifyMutation.mutate(); }}
                disabled={verifyMutation.isPending}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} className={verifyMutation.isPending ? 'animate-spin' : ''} />
                {verifyMutation.isPending ? 'Verificando...' : 'Re-verificar pago en MP'}
              </button>
            )}
          </div>
          {verifyMsg && <p className="mt-2 text-xs text-gray-500">{verifyMsg}</p>}
        </Section>

      </div>
    </div>
  );
}

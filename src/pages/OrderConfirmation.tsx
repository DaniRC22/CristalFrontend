import { useEffect } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Banknote, Users } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useSiteConfig } from '../hooks/useBanners';
import api from '../lib/api';
import type { CheckoutState } from '../types';

const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L0 24l6.335-1.508A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.87 9.87 0 01-5.031-1.374l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.1 12C2.1 6.532 6.532 2.1 12 2.1c5.469 0 9.9 4.432 9.9 9.9 0 5.469-4.431 9.9-9.9 9.9z"/>
  </svg>
);

function WaButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
      <WaIcon />
      {label}
    </a>
  );
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const orderState = state as CheckoutState | null;
  const status = searchParams.get('status');
  const method = searchParams.get('method');
  const clearCart = useCartStore((s) => s.clearCart);
  const { data: config } = useSiteConfig();

  // Limpiar carrito en cualquier resultado de MP o pagos no-MP
  useEffect(() => {
    if (status || method) clearCart();
  }, [status, method, clearCart]);

  // Cancelar orden en caso de fallo
  useEffect(() => {
    if (status === 'failure' && id) {
      api.patch(`/api/admin/orders/${id}/status`, { status: 'cancelled' }).catch(() => {});
    }
  }, [status, id]);

  const waNumber = config?.whatsapp?.replace(/\D/g, '');

  // Pagos no-MP (transferencia o presencial)
  if (method === 'transfer' || method === 'presencial') {
    const isTransfer = method === 'transfer';
    const b = orderState?.billing;
    const s = orderState?.shippingAddr;

    const addr = b
      ? [`${b.first_name} ${b.last_name}`.trim(), b.address + (b.address2 ? `, ${b.address2}` : ''), `${b.city}, ${b.province} CP ${b.postal_code}`].filter(Boolean).join('\n')
      : '';
    const shipAddr = s
      ? [`${s.first_name} ${s.last_name}`.trim(), s.address + (s.address2 ? `, ${s.address2}` : ''), `${s.city}, ${s.province} CP ${s.postal_code}`].filter(Boolean).join('\n')
      : '';
    const notes = orderState?.notes ? `\nNotas: ${orderState.notes}` : '';

    const waText = [`Hola! Realicé el pedido #${id} y quiero coordinar el pago.`, addr ? `\nDatos de facturación:\n${addr}` : '', shipAddr ? `\nDirección de envío:\n${shipAddr}` : '', notes].join('');
    const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : null;

    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido recibido!</h1>
        {id && <p className="text-xs text-gray-400 mb-5">Orden #{id}</p>}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left mb-6">
          <div className="flex items-center gap-3 mb-3">
            {isTransfer ? <Banknote size={20} className="text-gray-600" /> : <Users size={20} className="text-gray-600" />}
            <p className="font-semibold text-gray-900 text-sm">
              {isTransfer ? 'Pago por transferencia bancaria' : 'Pago en persona'}
            </p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isTransfer
              ? 'Te enviaremos los datos bancarios por WhatsApp para que realices la transferencia. Una vez confirmado el pago, procesamos tu pedido.'
              : 'Pasá por el local para abonar y retirar tu pedido. Te contactaremos para coordinar el horario.'}
          </p>
        </div>
        <div className="space-y-3">
          {waLink && <WaButton href={waLink} label="Coordinar por WhatsApp" />}
          <Link to="/" className="flex items-center justify-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // MP — pago aprobado
  if (status === 'success') {
    const waText = `Hola! Acabo de realizar el pago de mi pedido #${id} por MercadoPago. Quiero coordinar la entrega.`;
    const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : null;

    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago aprobado!</h1>
        {id && <p className="text-xs text-gray-400 mb-5">Orden #{id}</p>}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Tu pago fue procesado exitosamente. Contactanos por WhatsApp para coordinar la entrega de tu pedido.
          </p>
        </div>
        <div className="space-y-3">
          {waLink && <WaButton href={waLink} label="Coordinar entrega por WhatsApp" />}
          <Link to="/" className="flex items-center justify-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // MP — pago en proceso (Mercado Crédito y otros métodos con acreditación diferida)
  if (status === 'pending') {
    const waText = `Hola! Realicé el pedido #${id} con Mercado Crédito. El pago está siendo procesado. Quiero coordinar la entrega.`;
    const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : null;

    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Clock size={64} className="mx-auto mb-4 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido recibido!</h1>
        {id && <p className="text-xs text-gray-400 mb-5">Orden #{id}</p>}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left mb-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            Tu pago con Mercado Crédito está siendo procesado. En cuanto se confirme, preparamos tu pedido. Podés contactarnos ahora para coordinar la entrega.
          </p>
        </div>
        <div className="space-y-3">
          {waLink && <WaButton href={waLink} label="Coordinar entrega por WhatsApp" />}
          <Link to="/" className="flex items-center justify-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // MP — pago rechazado
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <XCircle size={64} className="mx-auto mb-4 text-red-500" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago rechazado</h1>
      <p className="text-gray-500 mb-2">Hubo un problema con tu pago. Podés intentarlo nuevamente.</p>
      {id && <p className="text-xs text-gray-400 mb-6">Orden #{id}</p>}
      <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}

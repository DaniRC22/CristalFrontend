import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, CreditCard, ArrowRight, Banknote, Users, ChevronLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import api from '../lib/api';
import PreparationNotice from '../components/common/PreparationNotice';
import CardPaymentBrick from '../components/checkout/CardPaymentBrick';
import type { PaymentMethod, ShippingMethod, CheckoutState } from '../types';

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
}

const PROVINCES = [
  'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco',
  'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

const shippingOptions: { value: ShippingMethod; label: string; desc: string; icon: typeof MapPin }[] = [
  { value: 'retiro', label: 'Retiro en el local', desc: 'Sin costo adicional', icon: MapPin },
  { value: 'flete', label: 'Flete', desc: 'A coordinar con el vendedor', icon: Truck },
];

const paymentOptions: { value: PaymentMethod; label: string; desc: string; icon: typeof CreditCard }[] = [
  { value: 'transfer', label: 'Transferencia bancaria', desc: 'Te enviamos los datos al confirmar', icon: Banknote },
  { value: 'presencial', label: 'Pago en persona', desc: 'Efectivo o cualquier medio al retirar', icon: Users },
  { value: 'mercadopago', label: 'Mercado Pago', desc: 'Billetera MP, Mercado Crédito y más', icon: CreditCard },
  { value: 'tarjeta', label: 'Tarjeta de crédito / débito', desc: 'Pagá directo con tu tarjeta, sin salir del sitio', icon: CreditCard },
];

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow';
const selectCls = `${inputCls} bg-white`;

interface AddrForm {
  first_name: string;
  last_name: string;
  company: string;
  address: string;
  address2: string;
  city: string;
  province: string;
  postal_code: string;
}

interface BillingForm extends AddrForm {
  phone: string;
  email: string;
}


const emptyAddr = (): AddrForm => ({
  first_name: '', last_name: '', company: '', address: '',
  address2: '', city: '', province: '', postal_code: '',
});
const emptyBilling = (): BillingForm => ({ ...emptyAddr(), phone: '', email: '' });

function ProvinceSelect({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className={selectCls}>
      <option value="">Elegí una opción…</option>
      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
    </select>
  );
}

function AddressFields({
  values,
  onChange,
  showContact = false,
}: {
  values: AddrForm & Partial<Pick<BillingForm, 'phone' | 'email'>>;
  onChange: (field: string, value: string) => void;
  showContact?: boolean;
}) {
  const inp = (name: string, opts?: { placeholder?: string; type?: string; required?: boolean }) => (
    <input
      name={name}
      type={opts?.type ?? 'text'}
      value={(values as unknown as Record<string, string>)[name] ?? ''}
      onChange={(e) => onChange(e.target.name, e.target.value)}
      placeholder={opts?.placeholder}
      required={opts?.required}
      className={inputCls}
    />
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
        {inp('first_name', { required: true })}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos *</label>
        {inp('last_name', { required: true })}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la empresa (opcional)</label>
        {inp('company')}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">País / Región *</label>
        <input value="Argentina" disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Dirección de la calle *</label>
        {inp('address', { placeholder: 'Número de la casa y nombre de la calle', required: true })}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Apartamento, habitación, unidad, etc. (opcional)</label>
        {inp('address2', { placeholder: 'Apartamento, habitación, unidad, etc.' })}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Localidad / Ciudad *</label>
        {inp('city', { required: true })}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Región / Provincia / Departamento *</label>
        <ProvinceSelect value={values.province} onChange={(v) => onChange('province', v)} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Código postal *</label>
        {inp('postal_code', { required: true })}
      </div>
      {showContact && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label>
            {inp('phone', { type: 'tel', required: true })}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico *</label>
            {inp('email', { type: 'email', required: true })}
          </div>
        </>
      )}
    </div>
  );
}

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [billing, setBilling] = useState<BillingForm>(emptyBilling());
  const [diffShipping, setDiffShipping] = useState(false);
  const [shippingAddr, setShippingAddr] = useState<AddrForm>(emptyAddr());
  const [notes, setNotes] = useState('');
  const [shipping, setShipping] = useState<ShippingMethod>('retiro');
  const [payment, setPayment] = useState<PaymentMethod>('transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [brickData, setBrickData] = useState<{
    orderId: number;
    total: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  } | null>(null);

  const handleBilling = (field: string, value: string) =>
    setBilling((prev) => ({ ...prev, [field]: value }));

  const handleShipAddr = (field: string, value: string) =>
    setShippingAddr((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/checkout', {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity, selected_options: i.selected_options ?? undefined })),
        first_name: billing.first_name,
        last_name: billing.last_name,
        customer_email: billing.email,
        customer_phone: billing.phone,
        address: billing.address,
        address2: billing.address2,
        city: billing.city,
        province: billing.province,
        postal_code: billing.postal_code,
        payment_method: payment,
        shipping_method: shipping,
        ...(diffShipping && shippingAddr.first_name && {
          shipping_first_name:  shippingAddr.first_name,
          shipping_last_name:   shippingAddr.last_name,
          shipping_address:     shippingAddr.address,
          shipping_address2:    shippingAddr.address2,
          shipping_city:        shippingAddr.city,
          shipping_province:    shippingAddr.province,
          shipping_postal_code: shippingAddr.postal_code,
        }),
      });

      sessionStorage.setItem(`order_${data.order_id}`, JSON.stringify({
        items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, selected_options: i.selected_options })),
        total: total(),
        payment_method: payment,
        shipping_method: shipping,
      }));

      if (data.needs_brick) {
        setBrickData({
          orderId: data.order_id,
          total: total(),
          email: billing.email,
          firstName: billing.first_name,
          lastName: billing.last_name,
          phone: billing.phone,
        });
        return;
      }

      if (data.needs_mp) {
        if (!data.init_point?.startsWith('https://www.mercadopago.com')) {
          setError('No se pudo iniciar el pago con Mercado Pago. Intentá de nuevo.');
          return;
        }
        window.location.href = data.init_point;
        return;
      } else {
        clearCart();
        const state: CheckoutState = {
          billing,
          shippingAddr: diffShipping ? shippingAddr : null,
          notes,
        };
        navigate(`/orden/${data.order_id}?status=pending&method=${payment}`, { state });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error ?? e.message ?? 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleBrickResult = (
    status: string,
    redirectUrls: { approved: string; rejected: string; pending: string },
  ) => {
    if (!brickData) return;
    const { orderId } = brickData;
    if (status === 'approved' || status === 'authorized') {
      clearCart();
      navigate(`/orden/${orderId}?status=success`);
    } else if (status === 'in_process' || status === 'pending') {
      clearCart();
      navigate(`/orden/${orderId}?status=pending`);
    } else {
      // rejected — usar la URL del backend que incluye el token de cancelación
      try {
        const url = new URL(redirectUrls.rejected);
        navigate(url.pathname + url.search);
      } catch {
        navigate(`/orden/${orderId}?status=failure`);
      }
    }
  };

  if (!items.length) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Tu carrito está vacío.</div>;
  }

  // Pantalla de pago con tarjeta (CardPayment Brick)
  if (brickData) {
    return (
      <>
        <Helmet><title>Pago con tarjeta — Cristal Equipamiento Comercial</title></Helmet>
        <div className="max-w-xl mx-auto px-4 py-10">
          <button
            type="button"
            onClick={() => setBrickData(null)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <ChevronLeft size={16} /> Volver al checkout
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago con tarjeta</h1>
          <p className="text-sm text-gray-500 mb-6">
            Orden #{brickData.orderId} · Total {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(brickData.total)}
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <CardPaymentBrick
              orderId={brickData.orderId}
              total={brickData.total}
              email={brickData.email}
              firstName={brickData.firstName}
              lastName={brickData.lastName}
              phone={brickData.phone}
              onResult={handleBrickResult}
              onError={(msg) => setError(msg)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Checkout — Cristal Equipamiento Comercial</title></Helmet>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar pedido</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Columna izquierda ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Datos de facturación */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Detalles de facturación</h2>
                <AddressFields values={billing} onChange={handleBilling} showContact />
              </section>

              {/* Dirección de envío diferente — solo disponible con flete */}
              {shipping === 'flete' && (
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={diffShipping}
                      onChange={(e) => setDiffShipping(e.target.checked)}
                      className="w-4 h-4 accent-gray-900"
                    />
                    <span className="font-semibold text-gray-900 text-sm">¿Enviar a una dirección diferente?</span>
                  </label>

                  {diffShipping && (
                    <div className="mt-5">
                      <AddressFields values={shippingAddr} onChange={handleShipAddr} />
                    </div>
                  )}
                </section>
              )}

              {/* Notas del pedido */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Notas del pedido (opcional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas sobre tu pedido, por ejemplo, notas especiales para la entrega."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow resize-none"
                />
              </section>

              {/* Envío */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Envío</h2>
                <div className="space-y-3">
                  {shippingOptions.map(({ value, label, desc, icon: Icon }) => (
                    <label key={value}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        shipping === value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      }`}>
                      <input type="radio" name="shipping" value={value}
                        checked={shipping === value} onChange={() => { setShipping(value); if (value === 'retiro') setDiffShipping(false); }}
                        className="accent-gray-900" />
                      <Icon size={18} className="text-gray-500 shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Método de pago */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Método de pago</h2>
                <div className="space-y-3">
                  {paymentOptions.map(({ value, label, desc, icon: Icon }) => (
                    <label key={value}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        payment === value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      }`}>
                      <input type="radio" name="payment" value={value}
                        checked={payment === value} onChange={() => setPayment(value)}
                        className="accent-gray-900" />
                      <Icon size={18} className="text-gray-500 shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

            </div>

            {/* ── Columna derecha: resumen ── */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Tu pedido</h2>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-800 font-medium leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Cant: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-2 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span>{shipping === 'retiro' ? 'Gratis' : 'A coordinar'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                <PreparationNotice variant="card" className="mt-5" />

                <p className="text-xs text-gray-400 mt-5 leading-relaxed">
                  Tus datos personales se utilizarán para procesar tu pedido y mejorar tu experiencia en el sitio.
                </p>

                <button type="submit" disabled={loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 disabled:opacity-60 transition-colors">
                  {loading ? 'Procesando...' : <>Realizar pedido <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

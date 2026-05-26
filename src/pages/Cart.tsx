import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import PreparationNotice from '../components/common/PreparationNotice';

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
}

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg mb-4">Tu carrito está vacío.</p>
        <Link to="/productos" className="text-blue-600 hover:underline">Ver productos</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Carrito — Cristal Equipamiento Comercial</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Carrito de compras</h1>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.cart_key} className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4">
              {/* Layout mobile: 2 filas. Desktop: 1 fila */}
              <div className="flex items-start gap-3 sm:gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 sm:w-16 sm:h-16 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/productos/${item.slug}`} className="text-sm font-medium text-gray-900 hover:underline line-clamp-2 sm:line-clamp-1">{item.name}</Link>
                  {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Object.entries(item.selected_options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{formatPrice(item.price)} c/u</p>
                </div>

                {/* Desktop: controles + precio + eliminar */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.cart_key, item.quantity - 1)} className="p-1 rounded border hover:bg-gray-50"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cart_key, item.quantity + 1)} className="p-1 rounded border hover:bg-gray-50"><Plus size={14} /></button>
                  </div>
                  <p className="w-24 text-right font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeItem(item.cart_key)} className="text-gray-400 hover:text-red-500" aria-label="Eliminar"><Trash2 size={18} /></button>
                </div>

                {/* Mobile: botón eliminar arriba a la derecha */}
                <button
                  onClick={() => removeItem(item.cart_key)}
                  className="sm:hidden text-gray-400 hover:text-red-500 p-1 -m-1 shrink-0"
                  aria-label="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Mobile: controles + precio en fila inferior */}
              <div className="flex sm:hidden items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.cart_key, item.quantity - 1)} className="p-1.5 rounded border hover:bg-gray-50"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cart_key, item.quantity + 1)} className="p-1.5 rounded border hover:bg-gray-50"><Plus size={14} /></button>
                </div>
                <p className="font-semibold text-sm text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(total())}</p>
          </div>
          <button onClick={() => navigate('/checkout')} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Continuar compra
          </button>
        </div>

        <PreparationNotice className="mt-4" />

      </div>
    </>
  );
}

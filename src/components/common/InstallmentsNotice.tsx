import { CreditCard } from 'lucide-react';

// Tramos de cuotas sin interés que el cliente tiene cargados en su panel de
// Mercado Pago (Comisiones y cuotas → Por ofrecer cuotas → montos mínimos).
// El mínimo aplica al TOTAL de la compra, no al precio de un producto suelto.
// Si cambian allá, cambiarlos acá. Orden: de menor a mayor.
const INSTALLMENT_TIERS = [
  { installments: 2, minAmount: 100000 },
  { installments: 3, minAmount: 200000 },
];

interface Props {
  // Solo para la variante 'overlay': si el producto por sí solo ya alcanza un
  // tramo, mostramos ese. Si no llega al mínimo más bajo, no mostramos nada
  // (el carrito podría llegar, pero prometerlo en la card sería mentir).
  price?: number;
  variant?: 'default' | 'overlay' | 'banner';
  className?: string;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function tierFor(price: number) {
  return [...INSTALLMENT_TIERS].reverse().find((t) => price >= t.minAmount) ?? null;
}

export default function InstallmentsNotice({ price, variant = 'default', className = '' }: Props) {
  if (variant === 'overlay') {
    const tier = price ? tierFor(price) : null;
    if (!tier) return null;
    return (
      <p className={`text-white/70 text-[10px] leading-tight mt-0.5 ${className}`}>
        {tier.installments} cuotas sin interés con Mercado Pago
      </p>
    );
  }

  // Franja de ancho completo para la home.
  if (variant === 'banner') {
    return (
      <div className={className} style={{ backgroundColor: '#d4a843' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-1 text-center">
          <span className="flex items-center gap-2.5 text-white text-sm tracking-wide">
            <CreditCard size={18} className="shrink-0" strokeWidth={1.5} />
            <span className="font-semibold">Cuotas sin interés a través de Mercado Pago</span>
          </span>
          <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-white/90 text-xs tracking-wide">
            {INSTALLMENT_TIERS.map((t) => (
              <span key={t.installments}>
                {t.installments} cuotas comprando a partir de {formatAmount(t.minAmount)}
              </span>
            ))}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-xs text-gray-600 ${className}`}>
      <p className="flex items-center gap-1.5">
        <CreditCard size={13} className="shrink-0" style={{ color: '#b8962e' }} />
        <span className="font-semibold" style={{ color: '#b8962e' }}>
          Cuotas sin interés a través de Mercado Pago
        </span>
      </p>
      <ul className="mt-1 ml-[1.15rem] space-y-0.5 text-gray-500">
        {INSTALLMENT_TIERS.map((t) => (
          <li key={t.installments}>
            {t.installments} cuotas comprando a partir de {formatAmount(t.minAmount)}
          </li>
        ))}
      </ul>
    </div>
  );
}

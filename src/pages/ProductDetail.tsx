import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, ChevronLeft, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduct } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import PreparationNotice from '../components/common/PreparationNotice';

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
}

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug!);
  const addItem = useCartStore((s) => s.addItem);
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const zoomRef = useRef<HTMLDivElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square rounded-2xl bg-gray-100" />
          <div className="space-y-4 pt-4">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-3/4 bg-gray-100 rounded" />
            <div className="h-10 w-1/3 bg-gray-100 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400 text-sm tracking-widest uppercase">
        Producto no encontrado.
      </div>
    );
  }

  const images = product.product_images?.sort((a, b) => a.order - b.order) ?? [];
  const currentImage = images[selectedImg];

  const sortedOptions = (product.product_options ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const allOptionsSelected = sortedOptions.every((opt) => !!selectedOptions[opt.name]);
  const canAddToCart = allOptionsSelected;

  // Precio efectivo: si el cliente seleccionó valores con override de precio,
  // usamos el MAX de los overrides. Si no, precio base. Misma lógica que
  // recalcula el backend en checkout (effectiveUnitPrice) — el backend es
  // la fuente de verdad, esto es solo para mostrarle el precio correcto al
  // cliente antes de que confirme.
  const variantOverrides: number[] = [];
  for (const opt of sortedOptions) {
    const sel = selectedOptions[opt.name];
    if (!sel || !opt.prices || opt.prices.length === 0) continue;
    const idx = opt.values.indexOf(sel);
    if (idx === -1) continue;
    const raw = opt.prices[idx];
    const n = raw === null || raw === undefined ? NaN : Number(raw);
    if (Number.isFinite(n) && n > 0) variantOverrides.push(n);
  }
  const currentPrice = variantOverrides.length > 0 ? Math.max(...variantOverrides) : product.price;
  const hasVariantOverride = variantOverrides.length > 0;

  const discountedPrice = product.transfer_discount_pct
    ? currentPrice * (1 - product.transfer_discount_pct / 100)
    : null;

  const maxQty = Math.max(1, product.stock);
  const clampedQuantity = Math.min(Math.max(1, quantity), maxQty);

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      stock: product.stock,
      image_url: images[0]?.thumb_url ?? images[0]?.url,
      slug: product.slug,
      selected_options: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
    }, clampedQuantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const missingOptions = sortedOptions.filter((o) => !selectedOptions[o.name]);

  return (
    <>
      <Helmet>
        <title>{product.name} — Cristal Equipamiento Comercial</title>
        <meta name="description" content={product.description ?? `Comprá ${product.name} en Cristal Equipamiento Comercial.`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: images.map((i) => i.url),
          offers: { '@type': 'Offer', price: product.price, priceCurrency: 'ARS', availability: 'https://schema.org/InStock' },
        })}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        <Link
          to={product.categories ? `/categorias/${product.categories.slug}` : '/productos'}
          className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase font-medium text-gray-400 hover:text-gray-900 transition-colors mb-8"
        >
          <ChevronLeft size={14} />
          {product.categories ? product.categories.name : 'Productos'}
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* Galería */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div
              ref={zoomRef}
              className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-100"
              style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
              onMouseEnter={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                setOrigin(`${x}% ${y}%`);
                setIsZoomed(true);
              }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                setOrigin(`${x}% ${y}%`);
              }}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImg}
                  src={currentImage?.url}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-contain p-4"
                  style={{
                    transform: isZoomed ? 'scale(2.8)' : 'scale(1)',
                    transformOrigin: origin,
                    transition: isZoomed
                      ? 'transform 0.3s ease, transform-origin 0s'
                      : 'transform 0.35s ease',
                  }}
                />
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors"
                    style={{ borderColor: i === selectedImg ? '#d4a843' : 'transparent' }}
                  >
                    <img src={img.thumb_url ?? img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Categoría */}
            {product.categories && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px" style={{ backgroundColor: '#d4a843' }} />
                <Link
                  to={`/categorias/${product.categories.slug}`}
                  className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {product.categories.name}
                </Link>
              </div>
            )}

            {/* Nombre */}
            <h1
              className="text-3xl md:text-4xl text-gray-900 leading-tight mb-6"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
            >
              {product.name}
            </h1>

            {/* Precios */}
            <div className="mb-6">
              {discountedPrice ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 line-through">{formatPrice(currentPrice)}</p>
                  <p
                    className="text-4xl text-gray-900"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400 }}
                  >
                    {formatPrice(discountedPrice)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pagando con transferencia —{' '}
                    <span style={{ color: '#b8962e' }} className="font-semibold">
                      {product.transfer_discount_pct}% off
                    </span>
                  </p>
                  {hasVariantOverride && (
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">
                      Precio según opción seleccionada
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p
                    className="text-4xl text-gray-900"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400 }}
                  >
                    {formatPrice(currentPrice)}
                  </p>
                  {hasVariantOverride && (
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Precio según opción seleccionada
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Separador dorado */}
            <div className="w-12 h-px mb-6" style={{ backgroundColor: '#d4a843' }} />

            {/* Descripción */}
            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Opciones (Color, Talle, etc.) */}
            {sortedOptions.length > 0 && (
              <div className="space-y-5 mb-8">
                {sortedOptions.map((opt) => (
                  <div key={opt.id}>
                    <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">
                      {opt.name}
                      {selectedOptions[opt.name] && (
                        <span className="normal-case tracking-normal font-normal text-gray-700 ml-2">
                          — {selectedOptions[opt.name]}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val;
                        return (
                          <button
                            key={val}
                            onClick={() =>
                              setSelectedOptions((prev) =>
                                isSelected
                                  ? { ...prev, [opt.name]: '' }
                                  : { ...prev, [opt.name]: val }
                              )
                            }
                            className="px-4 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200"
                            style={
                              isSelected
                                ? { backgroundColor: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' }
                                : { backgroundColor: '#fff', color: '#374151', borderColor: '#d1d5db' }
                            }
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Botón carrito */}
            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shrink-0 self-stretch">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={clampedQuantity <= 1}
                  className="px-4 h-full text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={clampedQuantity}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setQuantity(Number.isFinite(n) && n > 0 ? n : 1);
                  }}
                  className="w-12 text-center text-sm font-semibold text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Cantidad"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={clampedQuantity >= maxQty}
                  className="px-4 h-full text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Botón carrito */}
              <button
                onClick={handleAddToCart}
                disabled={sortedOptions.length > 0 && !allOptionsSelected}
                className="flex-1 flex items-center justify-center gap-2.5 text-white py-4 px-8 text-xs tracking-widest uppercase font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: added ? '#d4a843' : '#1a1a1a' }}
              >
                <ShoppingCart size={16} />
                {added
                  ? '¡Agregado al carrito!'
                  : sortedOptions.length > 0 && !allOptionsSelected
                  ? `Elegí ${missingOptions.map((o) => o.name).join(', ')}`
                  : 'Agregar al carrito'}
              </button>
            </div>

            <PreparationNotice className="mt-4" />

          </motion.div>

        </div>
      </div>
    </>
  );
}

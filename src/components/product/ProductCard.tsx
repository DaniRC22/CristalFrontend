import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';

interface Props {
  product: Product;
}

const ease = [0.25, 0.1, 0.25, 1] as const;

const imgHover = {
  rest: { scale: 1 },
  hover: { scale: 1.07, transition: { duration: 0.5, ease } },
};

const lineHover = {
  rest: { width: 0 },
  hover: { width: 32, transition: { duration: 0.3, ease } },
};

const footerHover = {
  rest: { opacity: 0, y: 4 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.25, ease } },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const primaryImage = product.product_images?.find((img) => img.is_primary) ?? product.product_images?.[0];
  const discountedPrice = product.transfer_discount_pct
    ? product.price * (1 - product.transfer_discount_pct / 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addItem(product);
  };

  return (
    <Link to={`/productos/${product.slug}`} className="block">
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] cursor-pointer"
      >
        {/* Imagen */}
        {primaryImage ? (
          <motion.img
            src={primaryImage.thumb_url ?? primaryImage.url}
            alt={product.name}
            loading="lazy"
            variants={imgHover}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 font-bold text-4xl">{product.name[0]}</span>
          </div>
        )}

        {/* Badge descuento */}
        {discountedPrice && (
          <div
            className="absolute top-3 right-3 z-20 text-xs font-semibold tracking-wide px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#d4a843', color: '#fff' }}
          >
            -{product.transfer_discount_pct}%
          </div>
        )}

        {/* Sin stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <span className="text-xs font-semibold tracking-widest uppercase text-white border border-white/50 px-3 py-1">
              Sin stock
            </span>
          </div>
        )}

        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Contenido inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
          <motion.div
            variants={lineHover}
            className="h-px mb-2"
            style={{ backgroundColor: '#d4a843' }}
          />

          <p className="text-white font-medium text-sm md:text-base leading-tight line-clamp-2 mb-1">
            {product.name}
          </p>

          {discountedPrice ? (
            <div className="flex items-baseline gap-2">
              <p
                className="text-white text-base font-semibold"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {formatPrice(discountedPrice)}
              </p>
              <p className="text-white/50 text-xs line-through">
                {formatPrice(product.price)}
              </p>
            </div>
          ) : (
            <p
              className="text-white text-base font-semibold"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {formatPrice(product.price)}
            </p>
          )}

          <motion.div
            variants={footerHover}
            className="flex items-center justify-between mt-2"
          >
            <StockDot stock={product.stock} />
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-1.5 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              aria-label="Agregar al carrito"
            >
              <ShoppingCart size={14} />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

function StockDot({ stock, threshold = 5 }: { stock: number; threshold?: number }) {
  if (stock === 0) return null;
  const isLow = stock <= threshold;
  return (
    <span className="flex items-center gap-1.5 text-xs text-white/60">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: isLow ? '#f59e0b' : '#22c55e' }}
      />
      {isLow ? `Últimas ${stock}` : 'En stock'}
    </span>
  );
}

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
            className="absolute inset-0 w-full h-full object-cover object-top"
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
            className="flex items-center justify-end mt-2"
          >
            <button
              onClick={handleAddToCart}
              className="p-1.5 rounded-lg text-white transition-colors"
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


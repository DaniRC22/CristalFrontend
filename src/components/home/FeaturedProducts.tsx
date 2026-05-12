import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../../types';
import ProductCard from '../product/ProductCard';

interface Props {
  products: Product[];
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function FeaturedProducts({ products }: Props) {
  return (
    <section className="py-16" style={{ backgroundColor: '#f9f8f6' }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-px" style={{ backgroundColor: '#d4a843' }} />
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-400">Selección</span>
            </div>
            <h2
              className="text-4xl md:text-5xl text-gray-900"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
            >
              Productos Destacados
            </h2>
          </div>

          <Link
            to="/productos"
            className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium text-gray-500 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900 pb-0.5"
          >
            Ver todos
            <span>→</span>
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={products.length > 0 ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Ver todos mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center sm:hidden"
        >
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 border border-gray-900 text-gray-900 px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            Ver todos los productos →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

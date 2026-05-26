import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useCategoryProducts, useCategories } from '../hooks/useCategories';
import ProductCard from '../components/product/ProductCard';

const ease = [0.25, 0.1, 0.25, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCategoryProducts(slug!, { page, limit: 20 });
  const { data: categories = [] } = useCategories();
  const category = categories.find((c) => c.slug === slug);

  return (
    <>
      <Helmet>
        <title>{category?.name ?? slug} — Cristal Equipamiento Comercial</title>
        <meta name="description" content={`Productos de la categoría ${category?.name ?? slug} en Cristal Equipamiento Comercial.`} />
      </Helmet>

      {/* Hero de categoría */}
      {category?.image_url && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">

        <Link
          to="/categorias"
          className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase font-medium text-gray-400 hover:text-gray-900 transition-colors mb-8"
        >
          <ChevronLeft size={14} />
          Categorías
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#d4a843' }} />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-400">Categoría</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <h1
            className="text-4xl md:text-5xl text-gray-900"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
          >
            {category?.name ?? slug}
          </h1>
          {data && !isLoading && (
            <p className="mt-2 text-sm text-gray-400 tracking-wide">
              {data.total} {data.total === 1 ? 'producto' : 'productos'}
            </p>
          )}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {data?.data.length === 0 ? (
              <p className="text-center text-gray-400 py-20 tracking-wide">Sin productos en esta categoría.</p>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {data?.data.map((product) => (
                  <motion.div key={product.id} variants={item}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Paginación */}
            {data && data.total > 20 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-5 py-2 border border-gray-300 text-xs tracking-widest uppercase font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <span
                  className="px-4 py-2 text-sm text-gray-400"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem' }}
                >
                  {page} / {Math.ceil(data.total / 20)}
                </span>
                <button
                  disabled={page >= Math.ceil(data.total / 20)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-5 py-2 border border-gray-300 text-xs tracking-widest uppercase font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

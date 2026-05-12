import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Category } from '../../types';

interface Props {
  categories: Category[];
}

const ease = [0.25, 0.1, 0.25, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

const imgHover = {
  rest: { scale: 1 },
  hover: { scale: 1.07, transition: { duration: 0.5, ease } },
};

const lineHover = {
  rest: { width: 0 },
  hover: { width: 32, transition: { duration: 0.3, ease } },
};

const subTextHover = {
  rest: { opacity: 0, y: 4 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.25, ease } },
};

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">

      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-px" style={{ backgroundColor: '#d4a843' }} />
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-gray-400">Explorar</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <h2
          className="text-4xl md:text-5xl text-gray-900"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
        >
          Categorías
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={categories.length > 0 ? 'visible' : 'hidden'}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {categories.map((cat) => (
          <motion.div key={cat.id} variants={cardAnim}>
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] cursor-pointer"
            >
              <Link to={`/categorias/${cat.slug}`} className="absolute inset-0 z-10" />

              {cat.image_url ? (
                <motion.img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="eager"
                  variants={imgHover}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-4xl">{cat.name[0]}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
                <motion.div
                  variants={lineHover}
                  className="h-px mb-2"
                  style={{ backgroundColor: '#d4a843' }}
                />
                <p className="text-white font-medium text-sm md:text-base leading-tight">
                  {cat.name}
                </p>
                <motion.p
                  variants={subTextHover}
                  className="text-white/60 text-xs mt-1 tracking-wider uppercase"
                >
                  Ver productos →
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

import { Helmet } from 'react-helmet-async';
import { Truck, Star, Tag, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBanners } from '../hooks/useBanners';
import { useFeaturedProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import BannerSlider from '../components/home/BannerSlider';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';

const benefits = [
  { icon: Truck, title: 'Envíos a todo el país', desc: 'Despachamos a cualquier provincia' },
  { icon: Star, title: 'Mejor calidad', desc: 'Productos seleccionados' },
  { icon: Tag, title: 'Mejores ofertas', desc: 'Precios competitivos' },
  { icon: Shield, title: 'Pagos seguros', desc: 'MercadoPago y transferencia' },
];

export default function Home() {
  const { data: banners = [] } = useBanners();
  const { data: featuredProducts = [] } = useFeaturedProducts();
  const { data: categories = [] } = useCategories();
  const [benefitsVisible, setBenefitsVisible] = useState(false);
  const benefitsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBenefitsVisible(true); },
      { threshold: 0.2 }
    );
    if (benefitsRef.current) observer.observe(benefitsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>KAP Equipamiento Comercial — Maniquíes, Percheros y más</title>
        <meta name="description" content="Equipamiento profesional para comercios. Maniquíes, percheros, mostradores, accesorios y más. Envíos a todo el país." />
      </Helmet>

      <BannerSlider banners={banners} />

      {/* Beneficios */}
      <section ref={benefitsRef} className="border-y border-gray-100 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex items-center gap-5 px-8 py-9"
                style={{
                  transitionDelay: `${i * 180}ms`,
                  transitionDuration: '900ms',
                  transitionProperty: 'opacity, transform',
                  opacity: benefitsVisible ? 1 : 0,
                  transform: benefitsVisible ? 'translateY(0)' : 'translateY(32px)',
                }}
              >
                <Icon size={24} className="text-gray-400 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-gray-900 tracking-wide">{title}</p>
                  <p className="text-xs text-gray-400 mt-1 tracking-wide">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategoryGrid categories={categories} />

      {featuredProducts.length > 0 && (
        <FeaturedProducts products={featuredProducts} />
      )}
    </>
  );
}

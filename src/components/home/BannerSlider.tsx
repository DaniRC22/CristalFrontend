import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Banner } from '../../types';

interface Props {
  banners: Banner[];
}

const ease = [0.25, 0.1, 0.25, 1] as const;

function SlideContent({
  title,
  subtitle,
  linkUrl,
  animKey,
}: {
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
  animKey: number;
}) {
  return (
    <AnimatePresence mode="wait">
      <div key={animKey} className="absolute inset-0 flex items-center">
        <div className="px-5 sm:px-8 md:px-20 max-w-3xl">
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="h-px w-8 sm:w-12 bg-white mb-3 sm:mb-5"
          />
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.25 }}
              className="text-2xl sm:text-4xl md:text-6xl font-light tracking-wide text-white leading-tight mb-2 sm:mb-3"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.45 }}
              className="text-[11px] sm:text-sm md:text-base font-light tracking-[0.2em] sm:tracking-widest uppercase text-white/75 mb-5 sm:mb-8"
            >
              {subtitle}
            </motion.p>
          )}
          {linkUrl && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.6 }}
            >
              <Link
                to={linkUrl}
                className="inline-flex items-center gap-2 sm:gap-3 border border-white text-white px-5 sm:px-7 py-2.5 sm:py-3 text-[11px] sm:text-xs tracking-widest uppercase font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Ver tienda
                <span className="text-base sm:text-lg leading-none">→</span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}

export default function BannerSlider({ banners }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 7000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">

          {banners.map((banner, i) => (
            <div key={banner.id} className="relative flex-none w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh]">
              {banner.image_url && (banner.image_url.includes('.mp4') || banner.image_url.includes('.webm')) ? (
                <video
                  src={banner.image_url}
                  autoPlay loop muted playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title ?? 'Banner'}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10 md:from-black/60 md:via-black/20 md:to-transparent" />

              {banner.title && (
                <SlideContent
                  title={banner.title}
                  subtitle={banner.subtitle}
                  linkUrl={banner.link_url}
                  animKey={selectedIndex === i + 1 ? selectedIndex : -1}
                />
              )}

              <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-white to-transparent" />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

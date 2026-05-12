import { useSiteConfig } from '../../hooks/useBanners';

const FALLBACK_NUMBER = '541154081774';

export default function WhatsAppButton() {
  const { data: config } = useSiteConfig();

  const raw = config?.whatsapp ?? FALLBACK_NUMBER;
  const number = raw.replace(/\D/g, '');
  const href = `https://wa.me/${number}?text=${encodeURIComponent('Hola! Quiero consultar sobre un producto.')}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-xl transition-all hover:scale-110 hover:shadow-green-500/30"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L0 24l6.335-1.508A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.87 9.87 0 01-5.031-1.374l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.1 12C2.1 6.532 6.532 2.1 12 2.1c5.469 0 9.9 4.432 9.9 9.9 0 5.469-4.431 9.9-9.9 9.9z"/>
      </svg>
    </a>
  );
}

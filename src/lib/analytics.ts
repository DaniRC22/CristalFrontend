// Capa única de medición: Google Analytics 4 (GA4) + Meta Pixel.
//
// Los scripts SOLO se cargan si están configurados los IDs en el entorno:
//   VITE_GA4_ID         (ej. "G-XXXXXXXXXX")
//   VITE_META_PIXEL_ID  (ej. "123456789012345")
// Si una variable está vacía, ese proveedor simplemente no se inicializa, así
// que en desarrollo no se ensucian los datos ni se cargan scripts de terceros.
//
// El resto de la app no habla con gtag/fbq directo: usa las funciones de este
// módulo (trackViewContent, trackAddToCart, etc.). Si mañana cambiás de
// herramienta, se toca solo este archivo.

const GA_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const CURRENCY = 'ARS';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: unknown;
    };
    _fbq?: unknown;
  }
}

let initialized = false;

/** Carga e inicializa los scripts de GA4 y Meta Pixel (idempotente). */
export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  if (GA_ID) initGA(GA_ID);
  if (PIXEL_ID) initPixel(PIXEL_ID);
}

function initGA(id: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // send_page_view: false → manejamos los page_view a mano en cada cambio de
  // ruta (es una SPA, no hay recargas reales de página).
  window.gtag('config', id, { send_page_view: false });
}

function initPixel(id: string) {
  /* eslint-disable */
  (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq!('init', id);
}

// ── Eventos ──────────────────────────────────────────────────────────────

export function trackPageView(path: string) {
  window.gtag?.('event', 'page_view', { page_path: path });
  window.fbq?.('track', 'PageView');
}

// Clic en WhatsApp: en este rubro el cierre de venta suele pasar por el chat,
// así que medirlo es tan importante como el carrito. `source` distingue de dónde
// salió el clic (botón flotante, confirmación de orden, página de contacto).
export function trackWhatsAppClick(source: string) {
  window.gtag?.('event', 'whatsapp_click', { source });
  // En Meta lo registramos como Contact, el evento estándar de "lead/contacto".
  window.fbq?.('track', 'Contact', { source });
}

interface TrackedProduct {
  id: number | string;
  name: string;
  price: number;
  quantity?: number;
}

export function trackViewContent(p: TrackedProduct) {
  window.gtag?.('event', 'view_item', {
    currency: CURRENCY,
    value: p.price,
    items: [{ item_id: String(p.id), item_name: p.name, price: p.price }],
  });
  window.fbq?.('track', 'ViewContent', {
    content_ids: [String(p.id)],
    content_name: p.name,
    content_type: 'product',
    value: p.price,
    currency: CURRENCY,
  });
}

export function trackAddToCart(p: TrackedProduct) {
  const qty = p.quantity ?? 1;
  const value = p.price * qty;
  window.gtag?.('event', 'add_to_cart', {
    currency: CURRENCY,
    value,
    items: [{ item_id: String(p.id), item_name: p.name, price: p.price, quantity: qty }],
  });
  window.fbq?.('track', 'AddToCart', {
    content_ids: [String(p.id)],
    content_name: p.name,
    content_type: 'product',
    contents: [{ id: String(p.id), quantity: qty }],
    value,
    currency: CURRENCY,
  });
}

export function trackInitiateCheckout(items: TrackedProduct[], value: number) {
  window.gtag?.('event', 'begin_checkout', {
    currency: CURRENCY,
    value,
    items: items.map((i) => ({
      item_id: String(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity ?? 1,
    })),
  });
  window.fbq?.('track', 'InitiateCheckout', {
    content_ids: items.map((i) => String(i.id)),
    content_type: 'product',
    contents: items.map((i) => ({ id: String(i.id), quantity: i.quantity ?? 1 })),
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    value,
    currency: CURRENCY,
  });
}

export function trackPurchase(orderId: number | string, value: number, items: TrackedProduct[]) {
  window.gtag?.('event', 'purchase', {
    transaction_id: String(orderId),
    currency: CURRENCY,
    value,
    items: items.map((i) => ({
      item_id: String(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity ?? 1,
    })),
  });
  window.fbq?.('track', 'Purchase', {
    content_ids: items.map((i) => String(i.id)),
    content_type: 'product',
    contents: items.map((i) => ({ id: String(i.id), quantity: i.quantity ?? 1 })),
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
    value,
    currency: CURRENCY,
  });
}

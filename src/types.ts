export type PaymentMethod = 'transfer' | 'presencial' | 'mercadopago';
export type ShippingMethod = 'retiro' | 'flete';
export type OrderStatus = 'pending' | 'approved' | 'cancelled';

export type Banner = {
  id: number;
  title?: string | null;
  subtitle?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  order: number;
  active: boolean;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  parent_id?: number | null;
  order?: number;
  active: boolean;
};

export type ProductImage = {
  id: number;
  product_id?: number;
  url: string;
  thumb_url?: string | null;
  order: number;
  is_primary: boolean;
};

export type ProductOption = {
  id: number;
  product_id?: number;
  name: string;            // e.g. "Color", "Talle"
  values: string[];        // e.g. ["Blanco", "Negro", "Piel"]
  sort_order: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  category_id?: number | null;
  price: number;
  transfer_discount_pct?: number | null;
  stock: number;
  low_stock_threshold: number;
  active: boolean;
  featured: boolean;
  created_at?: string;
  product_images?: ProductImage[];
  product_options?: ProductOption[];
  categories?: { name: string; slug: string } | null;
};

export type CartItem = {
  id: number;             // product id
  cart_key: string;       // unique key: "productId" or "productId::optionsJson"
  name: string;
  slug: string;
  price: number;
  stock: number;
  transfer_discount_pct?: number | null;
  product_images?: ProductImage[];
  image_url?: string;
  quantity: number;
  selected_options?: Record<string, string>;
};

export type OrderItem = {
  id: number;
  quantity: number;
  unit_price: number;
  selected_options?: Record<string, string> | null;
  products?: { id: number; name: string; slug: string } | null;
};

export type Order = {
  id: number;
  status: OrderStatus;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  mp_payment_id?: string | null;
  address?: string;
  address2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  payment_method?: PaymentMethod;
  shipping_method?: ShippingMethod;
  shipping_first_name?: string | null;
  shipping_last_name?: string | null;
  shipping_address?: string | null;
  shipping_address2?: string | null;
  shipping_city?: string | null;
  shipping_province?: string | null;
  shipping_postal_code?: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type StockItem = {
  id: number;
  name: string;
  stock: number;
  low_stock_threshold: number;
  status: 'ok' | 'low' | 'out';
  categories?: { name: string } | null;
};

export type SiteConfig = {
  whatsapp: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  about_text: string;
  shipping_text: string;
  [key: string]: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
};

export type OrderSummary = {
  items: Array<{ name: string; price: number; quantity: number; selected_options?: Record<string, string> }>;
  total: number;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
};

export interface CheckoutState {
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address: string;
    address2: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
  };
  shippingAddr: {
    first_name: string;
    last_name: string;
    company: string;
    address: string;
    address2: string;
    city: string;
    province: string;
    postal_code: string;
  } | null;
  notes: string;
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, Trash2, Star, Plus, X, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';
import api from '../../lib/api';
import type { Category, Product, ProductImage, ProductOption } from '../../types';

function normalizeName(n: string): string {
  return n.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function extractServerError(err: unknown): string | null {
  if (err instanceof AxiosError) {
    return err.response?.data?.error ?? err.message ?? null;
  }
  return null;
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', description: '', category_id: '', price: '',
    transfer_discount_pct: '', stock: '0', low_stock_threshold: '5',
    active: true, featured: false,
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [newOptName, setNewOptName] = useState('');
  const [newOptValues, setNewOptValues] = useState('');
  const [nameTouched, setNameTouched] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/api/admin/categories').then((r) => r.data),
  });

  const { data: product } = useQuery<Product>({
    queryKey: ['admin-product', id],
    queryFn: () => api.get(`/api/admin/products/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

  // Debounce del nombre para no consultar al backend en cada tecla.
  // 400ms es suficiente para que el usuario termine de tipear sin sentir lag.
  const [debouncedName, setDebouncedName] = useState('');
  useEffect(() => {
    const trimmed = form.name.trim();
    const t = setTimeout(() => setDebouncedName(trimmed), trimmed ? 400 : 0);
    return () => clearTimeout(t);
  }, [form.name]);

  // Chequeo proactivo de duplicado contra el backend (case-insensitive, sin
  // acentos). Excluye el propio producto cuando estamos editando.
  const { data: nameMatches } = useQuery<{ data: Product[] }>({
    queryKey: ['admin-products', 'name-check', debouncedName],
    queryFn: () => api.get('/api/admin/products', { params: { search: debouncedName, limit: 20 } }).then((r) => r.data),
    enabled: !!debouncedName,
  });

  const normalizedInput = normalizeName(form.name);
  const isDuplicate = !!nameMatches?.data?.some(
    (p) => normalizeName(p.name) === normalizedInput && String(p.id) !== String(id ?? ''),
  );

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, description: product.description ?? '',
        category_id: String(product.category_id ?? ''),
        price: String(product.price),
        transfer_discount_pct: product.transfer_discount_pct != null ? String(product.transfer_discount_pct) : '',
        stock: String(product.stock), low_stock_threshold: String(product.low_stock_threshold),
        active: product.active, featured: product.featured,
      });
      setImages(product.product_images ?? []);
      setOptions((product.product_options ?? []).slice().sort((a, b) => a.sort_order - b.sort_order));
    }
  }, [product]);

  const saveMutation = useMutation({
    mutationFn: (body: object) =>
      isEdit ? api.put(`/api/admin/products/${id}`, body) : api.post('/api/admin/products', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/admin/productos');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    if (isDuplicate) return;
    saveMutation.mutate({
      ...form,
      price: parseFloat(form.price),
      category_id: parseInt(form.category_id),
      stock: parseInt(form.stock),
      low_stock_threshold: parseInt(form.low_stock_threshold),
      transfer_discount_pct: form.transfer_discount_pct !== '' ? parseInt(form.transfer_discount_pct) : null,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isEdit) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('is_primary', String(images.length === 0));
      const { data } = await api.post(`/api/admin/products/${id}/images`, fd);
      setImages((prev) => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imgId: number) => {
    await api.delete(`/api/admin/products/${id}/images/${imgId}`);
    setImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  const handleAddOption = async () => {
    const name = newOptName.trim();
    const values = newOptValues.split(',').map((v) => v.trim()).filter(Boolean);
    if (!name || values.length === 0) return;
    const { data } = await api.post(`/api/admin/products/${id}/options`, {
      name,
      values,
      sort_order: options.length,
    });
    setOptions((prev) => [...prev, data]);
    setNewOptName('');
    setNewOptValues('');
  };

  const handleDeleteOption = async (optId: number) => {
    await api.delete(`/api/admin/products/${id}/options/${optId}`);
    setOptions((prev) => prev.filter((o) => o.id !== optId));
  };

  const handleRemoveValue = async (opt: ProductOption, val: string) => {
    const idx = opt.values.indexOf(val);
    if (idx === -1) return;
    const newValues = opt.values.filter((_, i) => i !== idx);
    const newPrices = opt.prices && opt.prices.length > 0
      ? opt.prices.filter((_, i) => i !== idx)
      : [];
    const { data } = await api.put(`/api/admin/products/${id}/options/${opt.id}`, {
      name: opt.name,
      values: newValues,
      prices: newPrices,
      sort_order: opt.sort_order,
    });
    setOptions((prev) => prev.map((o) => (o.id === opt.id ? data : o)));
  };

  const handleAddValue = async (opt: ProductOption, value: string) => {
    const trimmed = value.trim();
    if (!trimmed || opt.values.includes(trimmed)) return;
    const newValues = [...opt.values, trimmed];
    // Si la opción ya tenía prices, agregamos null al final para mantener el
    // length-match. Si no tenía prices, dejamos vacío (sin overrides).
    const newPrices = opt.prices && opt.prices.length > 0 ? [...opt.prices, null] : [];
    const { data } = await api.put(`/api/admin/products/${id}/options/${opt.id}`, {
      name: opt.name,
      values: newValues,
      prices: newPrices,
      sort_order: opt.sort_order,
    });
    setOptions((prev) => prev.map((o) => (o.id === opt.id ? data : o)));
  };

  // Actualiza el precio override de un valor específico de una opción.
  // Si el precio es '' o 0, se guarda como null (= "usar precio base").
  // Se llama solo en blur (no en cada keystroke) para no hacer N requests.
  const handleUpdatePrice = async (opt: ProductOption, idx: number, raw: string) => {
    const trimmed = raw.trim();
    const parsed = trimmed === '' ? null : parseFloat(trimmed);
    const newPriceAtIdx = trimmed === '' || !Number.isFinite(parsed!) || parsed! <= 0 ? null : parsed!;

    const existing = opt.prices && opt.prices.length > 0
      ? opt.prices.slice()
      : (Array(opt.values.length).fill(null) as (number | null)[]);
    // Por las dudas, si el length no matchea (datos viejos), lo igualamos
    while (existing.length < opt.values.length) existing.push(null);
    existing.length = opt.values.length;
    existing[idx] = newPriceAtIdx;

    const { data } = await api.put(`/api/admin/products/${id}/options/${opt.id}`, {
      name: opt.name,
      values: opt.values,
      prices: existing,
      sort_order: opt.sort_order,
    });
    setOptions((prev) => prev.map((o) => (o.id === opt.id ? data : o)));
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate('/admin/productos')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} /> Volver
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              onBlur={() => setNameTouched(true)}
              required
              aria-invalid={isDuplicate || undefined}
              className={`${inputClass} ${isDuplicate && nameTouched ? 'border-red-400 focus:ring-red-500' : ''}`}
            />
            {isDuplicate && nameTouched && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={13} /> Ya existe un producto con ese nombre
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.category_id} onChange={(e) => setForm(p => ({ ...p, category_id: e.target.value }))} className={inputClass}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (ARS) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descuento por transferencia (%)<span className="text-gray-400 text-xs ml-1">opcional</span></label>
            <input type="number" min="0" max="100" value={form.transfer_discount_pct} onChange={(e) => setForm(p => ({ ...p, transfer_discount_pct: e.target.value }))} placeholder="Ej: 10" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm(p => ({ ...p, stock: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Umbral stock bajo</label>
            <input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => setForm(p => ({ ...p, low_stock_threshold: e.target.value }))} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className={inputClass} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
              Activo
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm(p => ({ ...p, featured: e.target.checked }))} className="rounded" />
              Destacado
            </label>
          </div>
        </div>

        {saveMutation.isError && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle size={15} />
            {extractServerError(saveMutation.error) ?? 'Error al guardar. Revisá los datos.'}
          </p>
        )}

        <button
          type="submit"
          disabled={saveMutation.isPending || isDuplicate}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {saveMutation.isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear producto'}
        </button>
      </form>

      {/* Imágenes — solo disponible en modo edición */}
      {isEdit && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Imágenes</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {images.sort((a, b) => a.order - b.order).map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img.thumb_url ?? img.url} alt="" className="w-full h-full object-cover" />
                {img.is_primary && (
                  <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 rounded px-1 text-xs flex items-center gap-0.5"><Star size={10} /> Principal</div>
                )}
                <button onClick={() => handleDeleteImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-blue-500 transition-colors">
              <Upload size={24} />
              <span className="text-xs mt-1">{uploading ? 'Subiendo...' : 'Agregar'}</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400">Las imágenes se convierten a WebP automáticamente. La primera imagen subida es la principal.</p>
        </div>
      )}

      {/* Opciones de producto (Color, Talle, etc.) — solo en modo edición */}
      {isEdit && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Opciones del producto</h2>
          <p className="text-xs text-gray-400 mb-4">Agregá atributos como Color, Talle o Material. El cliente deberá elegir antes de comprar.</p>

          <div className="space-y-4 mb-6">
            {options.map((opt) => (
              <OptionRow
                key={opt.id}
                opt={opt}
                onDelete={() => handleDeleteOption(opt.id)}
                onRemoveValue={(val) => handleRemoveValue(opt, val)}
                onAddValue={(val) => handleAddValue(opt, val)}
                onUpdatePrice={(idx, raw) => handleUpdatePrice(opt, idx, raw)}
              />
            ))}
          </div>

          {/* Agregar nueva opción */}
          <div className="border border-dashed border-gray-300 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Nueva opción</p>
            <div className="flex gap-3 flex-wrap">
              <input
                value={newOptName}
                onChange={(e) => setNewOptName(e.target.value)}
                placeholder="Nombre (ej: Color)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-32"
              />
              <input
                value={newOptValues}
                onChange={(e) => setNewOptValues(e.target.value)}
                placeholder="Valores separados por coma (ej: Blanco, Negro, Piel)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-[3] min-w-48"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
              />
              <button
                type="button"
                onClick={handleAddOption}
                disabled={!newOptName.trim() || !newOptValues.trim()}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={15} /> Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {!isEdit && (
        <p className="mt-6 text-sm text-gray-400">Guardá el producto primero para poder subir imágenes y configurar opciones.</p>
      )}
    </div>
  );
}

function OptionRow({
  opt,
  onDelete,
  onRemoveValue,
  onAddValue,
  onUpdatePrice,
}: {
  opt: ProductOption;
  onDelete: () => void;
  onRemoveValue: (val: string) => void;
  onAddValue: (val: string) => void;
  onUpdatePrice: (idx: number, raw: string) => void;
}) {
  const [adding, setAdding] = useState('');

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">{opt.name}</span>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
          <Trash2 size={13} /> Eliminar opción
        </button>
      </div>

      <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-400 px-1 mb-1">
        <span>Valor</span>
        <span>Precio (opcional)</span>
      </div>

      <div className="space-y-1.5 mb-3">
        {opt.values.map((val, idx) => (
          <ValueRow
            key={`${val}-${idx}`}
            value={val}
            initialPrice={opt.prices?.[idx] ?? null}
            onRemove={() => onRemoveValue(val)}
            onPriceCommit={(raw) => onUpdatePrice(idx, raw)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddValue(adding);
              setAdding('');
            }
          }}
          onBlur={() => { if (adding.trim()) { onAddValue(adding); setAdding(''); } }}
          placeholder="+ Agregar valor"
          className="border border-dashed border-gray-300 rounded-full px-3 py-1 text-sm text-gray-500 focus:outline-none focus:border-blue-400 w-36"
        />
      </div>
    </div>
  );
}

// Fila de un valor con su precio opcional. Mantiene el precio en estado local
// y solo lo commitea (network call) al hacer blur o Enter, para no disparar
// un PUT en cada tecla.
function ValueRow({
  value,
  initialPrice,
  onRemove,
  onPriceCommit,
}: {
  value: string;
  initialPrice: number | string | null;
  onRemove: () => void;
  onPriceCommit: (raw: string) => void;
}) {
  const [price, setPrice] = useState(initialPrice === null || initialPrice === undefined ? '' : String(initialPrice));

  const commit = () => {
    const current = price.trim();
    const original = initialPrice === null || initialPrice === undefined ? '' : String(initialPrice);
    if (current === original) return;
    onPriceCommit(current);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
        {value}
      </span>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">$</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="base"
          className="w-28 pl-5 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500 p-1" aria-label="Eliminar valor">
        <X size={14} />
      </button>
    </div>
  );
}

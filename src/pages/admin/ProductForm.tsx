import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, Trash2, Star, Plus, X } from 'lucide-react';
import api from '../../lib/api';
import type { Category, Product, ProductImage, ProductOption } from '../../types';

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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/api/admin/categories').then((r) => r.data),
  });

  const { data: product } = useQuery<Product>({
    queryKey: ['admin-product', id],
    queryFn: () => api.get(`/api/admin/products/${id}`).then((r) => r.data),
    enabled: isEdit,
  });

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
    const newValues = opt.values.filter((v) => v !== val);
    const { data } = await api.put(`/api/admin/products/${id}/options/${opt.id}`, {
      name: opt.name,
      values: newValues,
      sort_order: opt.sort_order,
    });
    setOptions((prev) => prev.map((o) => (o.id === opt.id ? data : o)));
  };

  const handleAddValue = async (opt: ProductOption, value: string) => {
    const trimmed = value.trim();
    if (!trimmed || opt.values.includes(trimmed)) return;
    const { data } = await api.put(`/api/admin/products/${id}/options/${opt.id}`, {
      name: opt.name,
      values: [...opt.values, trimmed],
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
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required className={inputClass} />
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

        {saveMutation.isError && <p className="text-sm text-red-600">Error al guardar. Revisá los datos.</p>}

        <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60">
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
}: {
  opt: ProductOption;
  onDelete: () => void;
  onRemoveValue: (val: string) => void;
  onAddValue: (val: string) => void;
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
      <div className="flex flex-wrap gap-2">
        {opt.values.map((val) => (
          <span key={val} className="flex items-center gap-1 bg-white border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700">
            {val}
            <button onClick={() => onRemoveValue(val)} className="text-gray-400 hover:text-red-500 ml-0.5">
              <X size={12} />
            </button>
          </span>
        ))}
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

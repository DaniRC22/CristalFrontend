import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Eye, EyeOff, Pencil, X, Check } from 'lucide-react';
import type { AxiosError } from 'axios';
import api from '../../lib/api';
import type { Banner } from '../../types';

interface EditForm {
  title: string;
  subtitle: string;
  link_url: string;
  order: string;
}

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', subtitle: '', link_url: '', order: '0' });
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: '', subtitle: '', link_url: '', order: '0' });
  const [editFile, setEditFile] = useState<File | null>(null);

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['admin-banners'],
    queryFn: () => api.get('/api/admin/banners').then((r) => r.data),
  });

  const createMutation = useMutation<unknown, AxiosError<{ error: string }>, FormData>({
    mutationFn: (fd) => api.post('/api/admin/banners', fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setForm({ title: '', subtitle: '', link_url: '', order: '0' });
      setFile(null);
    },
  });

  const updateMutation = useMutation<unknown, AxiosError<{ error: string }>, { id: number; fd: FormData }>({
    mutationFn: ({ id, fd }) => api.put(`/api/admin/banners/${id}`, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setEditingId(null);
      setEditFile(null);
    },
  });

  const toggleMutation = useMutation<unknown, AxiosError, { id: number; active: boolean }>({
    mutationFn: ({ id, active }) => {
      const fd = new FormData();
      fd.append('active', String(active));
      return api.put(`/api/admin/banners/${id}`, fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const deleteMutation = useMutation<unknown, AxiosError<{ error: string }>, number>({
    mutationFn: (id) => api.delete(`/api/admin/banners/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-banners'] }),
  });

  const handleCreate = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    createMutation.mutate(fd);
  };

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setEditForm({
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      link_url: banner.link_url ?? '',
      order: String(banner.order ?? 0),
    });
    setEditFile(null);
  };

  const handleUpdate = (id: number) => {
    const fd = new FormData();
    if (editFile) fd.append('image', editFile);
    Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
    updateMutation.mutate({ id, fd });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Banners del home</h1>

      {createMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Error al crear banner</p>
          <p className="text-xs text-red-600 mt-1">
            {createMutation.error.response?.data?.error ?? createMutation.error.message ?? 'Error desconocido'}
          </p>
        </div>
      )}

      {createMutation.isSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Banner creado exitosamente</p>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Error al eliminar banner</p>
          <p className="text-xs text-red-600 mt-1">
            {deleteMutation.error.response?.data?.error ?? deleteMutation.error.message ?? 'Error desconocido'}
          </p>
        </div>
      )}

      {updateMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Error al actualizar banner</p>
          <p className="text-xs text-red-600 mt-1">
            {updateMutation.error.response?.data?.error ?? updateMutation.error.message ?? 'Error desconocido'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Agregar banner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Imagen *</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
            <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
            <input value={form.subtitle} onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link (URL interna)</label>
            <input value={form.link_url} onChange={(e) => setForm(p => ({ ...p, link_url: e.target.value }))} placeholder="/productos"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Orden</label>
            <input type="number" value={form.order} onChange={(e) => setForm(p => ({ ...p, order: e.target.value }))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button onClick={handleCreate} disabled={!file || createMutation.isPending}
          className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
          <Plus size={16} /> {createMutation.isPending ? 'Subiendo...' : 'Agregar banner'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className={`rounded-xl overflow-hidden border bg-white ${banner.active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'}`}>
              {/* Preview */}
              <div className="relative">
                {banner.image_url && <img src={banner.image_url} alt={banner.title ?? ''} className="w-full h-40 object-cover" />}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => editingId === banner.id ? setEditingId(null) : startEdit(banner)}
                    className={`p-1.5 rounded-lg shadow ${editingId === banner.id ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-600 hover:text-blue-600'}`}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => toggleMutation.mutate({ id: banner.id, active: !banner.active })}
                    className="bg-white/90 p-1.5 rounded-lg shadow text-gray-600 hover:text-blue-600">
                    {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={() => { if (confirm('¿Eliminar banner?')) deleteMutation.mutate(banner.id); }}
                    className="bg-white/90 p-1.5 rounded-lg shadow text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Info básica */}
              <div className="px-3 py-2 border-t border-gray-100">
                {banner.title && <p className="font-semibold text-sm text-gray-900">{banner.title}</p>}
                {banner.subtitle && <p className="text-xs text-gray-500">{banner.subtitle}</p>}
                <p className="text-xs text-gray-400 mt-1">Orden: {banner.order}</p>
              </div>

              {/* Formulario de edición inline */}
              {editingId === banner.id && (
                <div className="border-t border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">Editar banner</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nueva imagen (opcional)</label>
                      <input type="file" accept="image/*"
                        onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                        className="text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                      <input value={editForm.title}
                        onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
                      <input value={editForm.subtitle}
                        onChange={(e) => setEditForm(p => ({ ...p, subtitle: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Link (URL interna)</label>
                      <input value={editForm.link_url}
                        onChange={(e) => setEditForm(p => ({ ...p, link_url: e.target.value }))}
                        placeholder="/productos"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Orden</label>
                      <input type="number" value={editForm.order}
                        onChange={(e) => setEditForm(p => ({ ...p, order: e.target.value }))}
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleUpdate(banner.id)}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                      <Check size={15} /> {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={() => { setEditingId(null); setEditFile(null); }}
                      className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                      <X size={15} /> Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!banners.length && <p className="text-sm text-gray-400 col-span-2">Sin banners aún.</p>}
        </div>
      )}
    </div>
  );
}

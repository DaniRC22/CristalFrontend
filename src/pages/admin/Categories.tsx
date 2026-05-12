import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import api from '../../lib/api';
import type { Category } from '../../types';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/api/admin/categories').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => api.post('/api/admin/categories', fd),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setNewName(''); setNewFile(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => api.put(`/api/admin/categories/${id}`, fd),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    const fd = new FormData();
    fd.append('name', newName);
    if (newFile) fd.append('image', newFile);
    createMutation.mutate(fd);
  };

  const handleUpdate = (cat: Category) => {
    const fd = new FormData();
    fd.append('name', cat.name);
    if (newFile) fd.append('image', newFile);
    updateMutation.mutate({ id: cat.id, fd });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorías</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b text-gray-500 text-left">
            <tr><th className="px-4 py-3">Imagen</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Activa</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Cargando...</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                    {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editing?.id === cat.id ? (
                    <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <span className="font-medium text-gray-900">{cat.name}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.active ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {editing?.id === cat.id ? (
                      <>
                        <label className="cursor-pointer text-xs text-blue-600 hover:underline">
                          Cambiar imagen
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} />
                        </label>
                        <button onClick={() => handleUpdate(editing)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                        <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditing(cat)} className="p-1.5 text-gray-400 hover:text-blue-600"><Pencil size={16} /></button>
                        <button onClick={() => { if (confirm(`¿Eliminar "${cat.name}"?`)) deleteMutation.mutate(cat.id); }} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* Fila para crear nueva */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3">
                <label className="cursor-pointer w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 text-xs">
                  <Plus size={16} />
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} />
                </label>
                {newFile && <p className="text-xs text-gray-500 mt-1 truncate w-20">{newFile.name}</p>}
              </td>
              <td className="px-4 py-3">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nueva categoría..."
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
              </td>
              <td />
              <td className="px-4 py-3">
                <button onClick={handleCreate} disabled={!newName.trim() || createMutation.isPending}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-60">
                  <Plus size={14} /> Agregar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

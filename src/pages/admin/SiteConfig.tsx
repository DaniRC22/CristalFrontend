import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import api from '../../lib/api';
import type { SiteConfig } from '../../types';

const fields = [
  { key: 'whatsapp', label: 'WhatsApp (número con código de país)', placeholder: '5491112345678' },
  { key: 'phone', label: 'Teléfono', placeholder: '011 1234-5678' },
  { key: 'email', label: 'Email de contacto', placeholder: 'info@cristalequipamientos.com' },
  { key: 'instagram', label: 'Instagram (URL completa)', placeholder: 'https://instagram.com/cristalequipamientos' },
  { key: 'facebook', label: 'Facebook (URL completa)', placeholder: 'https://facebook.com/cristalequipamientos' },
];

export default function AdminSiteConfig() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<SiteConfig>({} as SiteConfig);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery<SiteConfig>({
    queryKey: ['admin-config'],
    queryFn: () => api.get('/api/admin/config').then((r) => r.data),
  });

  useEffect(() => { if (data) setConfig(data); }, [data]);

  const mutation = useMutation({
    mutationFn: (body: SiteConfig) => api.put('/api/admin/config', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(config);
  };

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Cargando...</div>;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración del sitio</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input value={config[key] ?? ''} onChange={(e) => setConfig(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder} className={inputClass} />
          </div>
        ))}

        <button type="submit" disabled={mutation.isPending}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {saved ? <><Check size={16} /> Guardado</> : mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

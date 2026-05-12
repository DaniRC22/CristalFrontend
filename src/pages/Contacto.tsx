import { Helmet } from 'react-helmet-async';
import { useSiteConfig } from '../hooks/useBanners';
import { Phone, Mail } from 'lucide-react';

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export default function Contacto() {
  const { data: config } = useSiteConfig();
  const waNumber = config?.whatsapp?.replace(/\D/g, '');

  return (
    <>
      <Helmet>
        <title>Contacto — KAP Equipamiento Comercial</title>
        <meta name="description" content="Contactá a KAP Equipamiento Comercial por WhatsApp, email o redes sociales." />
      </Helmet>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contacto</h1>

        <div className="space-y-4">
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.849L0 24l6.335-1.508A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.87 9.87 0 01-5.031-1.374l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 012.1 12C2.1 6.532 6.532 2.1 12 2.1c5.469 0 9.9 4.432 9.9 9.9 0 5.469-4.431 9.9-9.9 9.9z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">{config?.whatsapp}</p>
              </div>
            </a>
          )}

          {config?.phone && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Teléfono</p>
                <p className="text-sm text-gray-600">{config.phone}</p>
              </div>
            </div>
          )}

          {config?.email && (
            <a href={`mailto:${config.email}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{config.email}</p>
              </div>
            </a>
          )}

          <div className="flex gap-4 pt-4">
            {config?.instagram && (
              <a href={config.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <InstagramIcon size={18} /> Instagram
              </a>
            )}
            {config?.facebook && (
              <a href={config.facebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <FacebookIcon size={18} /> Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

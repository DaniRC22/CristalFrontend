import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../hooks/useBanners';
import { Phone, Mail, MapPin } from 'lucide-react';
import logo from '../../assets/Logo.jpeg';

const navLinks = [
  ['/productos', 'Productos'],
  ['/categorias', 'Categorías'],
  ['/nosotros', 'Nosotros'],
  ['/envios', 'Envíos'],
  ['/contacto', 'Contacto'],
];

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

export default function Footer() {
  const { data: config } = useSiteConfig();

  return (
    <footer className="bg-[#0f0f0f] text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">

        {/* 3 columnas: Navegación | Logo | Contacto */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 mb-14">

          {/* Navegación — izquierda */}
          <div className="md:text-left text-center w-full md:w-auto">
            <p className="text-[10px] tracking-[0.25em] uppercase text-gray-600 mb-4">Navegación</p>
            <ul className="space-y-2">
              {navLinks.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors tracking-wide">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo — centro */}
          <div className="flex flex-col items-center text-center shrink-0 mx-auto md:mx-0">
            <Link to="/">
              <img src={logo} alt="KAP Logo" className="h-60 w-60 rounded-full object-cover mb-6 ring-1 ring-white/10" />
            </Link>
            <h2 className="text-white text-2xl font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Cristal Equipamiento Comercial
            </h2>
            <div className="w-8 h-px bg-gray-700 mt-5" />
          </div>

          {/* Contacto — derecha */}
          <div className="md:text-left text-center w-full md:w-auto">
            <p className="text-[10px] tracking-[0.25em] uppercase text-gray-600 mb-4">Contacto</p>
            <ul className="space-y-3 text-sm">
              {config?.phone && (
                <li className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                  <Phone size={13} className="shrink-0" />
                  <span className="tracking-wide">{config.phone}</span>
                </li>
              )}
              {config?.email && (
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <Mail size={13} className="shrink-0" />
                  <a href={`mailto:${config.email}`} className="hover:text-white transition-colors tracking-wide">
                    {config.email}
                  </a>
                </li>
              )}
              <li className="flex items-start justify-center md:justify-start gap-2 text-gray-400">
                <MapPin size={13} className="shrink-0 mt-0.5" />
                <span className="tracking-wide leading-relaxed">
                  Emilio Lamarca 388<br />
                  Felipe Vallese 3346
                </span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6 justify-center md:justify-start">
              {config?.instagram && (
                <a href={config.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:border-white hover:text-white transition-all">
                  <InstagramIcon size={16} />
                </a>
              )}
              {config?.facebook && (
                <a href={config.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:border-white hover:text-white transition-all">
                  <FacebookIcon size={16} />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[11px] tracking-widest uppercase text-gray-600">
            © {new Date().getFullYear()} Cristal Equipamiento Comercial
          </p>
          <p className="text-[11px] text-gray-700 tracking-wide">Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}

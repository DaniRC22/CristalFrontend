import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import logo from '../../assets/Logo.jpeg';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/productos', label: 'Productos' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/envios', label: 'Envíos' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const itemCount = useCartStore((s) => s.itemCount());
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="KAP Logo" className="h-14 w-14 rounded-full object-cover" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/carrito" className="relative p-2 text-gray-600 hover:text-gray-900">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium py-1 ${isActive ? 'text-blue-600' : 'text-gray-700'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

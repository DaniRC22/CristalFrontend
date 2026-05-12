import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Package, Tag, Image, BarChart2, ShoppingBag, Settings, LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: Tag },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/stock', label: 'Stock', icon: BarChart2 },
  { to: '/admin/ordenes', label: 'Órdenes', icon: ShoppingBag },
  { to: '/admin/config', label: 'Configuración', icon: Settings },
];

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-700">
          <p className="font-bold text-lg">KAP Admin</p>
          <p className="text-xs text-gray-400 truncate">{email}</p>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 text-sm text-gray-400 hover:text-white border-t border-gray-700 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

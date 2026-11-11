import { NavLink, Outlet } from 'react-router-dom';
import BrandLogo from '../../components/BrandLogo';
import StoreLogo from '../../components/StoreLogo';
import { useAuth } from '../../context/AuthContext';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const NAV = [
  { to: '/admin', end: true, label: 'Нарачки', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4' },
  { to: '/admin/products', label: 'Производи', icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/admin/settings', label: 'Поставки', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2l.4 2.6h4l.4-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z' },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-navy-800 text-white' : 'text-navy-700 hover:bg-slate-100'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${isActive ? 'text-navy-800' : 'text-slate-400'}`;

export default function AdminLayout() {
  const { store, user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-slate-50 md:flex">
      {/* Десктоп странична лента */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="px-2 py-2">
          <BrandLogo variant="wordmark" to="/admin" />
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <StoreLogo store={store} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900">{store?.name}</p>
            <a href={`/${store?.slug}`} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-teal-600 hover:underline">
              /{store?.slug} ↗
            </a>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <Icon d={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <p className="truncate px-3 text-xs text-slate-500">{user?.email}</p>
          <button type="button" onClick={logout} className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
            Одјави се
          </button>
        </div>
      </aside>

      {/* Мобилно заглавие */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:hidden">
        <BrandLogo to="/admin" />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy-900">{store?.name}</p>
        <a href={`/${store?.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
          Каталог ↗
        </a>
        <button type="button" onClick={logout} className="text-xs font-medium text-slate-500" aria-label="Одјави се">
          Одјава
        </button>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">
        <Outlet />
      </main>

      {/* Мобилна навигација на дното */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pt-1 md:hidden">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClass}>
            <Icon d={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

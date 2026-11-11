export const ALL_CATEGORIES = '__all__';

export default function CategoryTabs({ categories, active, onChange }) {
  if (!categories.length) return null;
  const tabs = [{ key: ALL_CATEGORIES, label: 'Сите' }, ...categories.map((c) => ({ key: c, label: c }))];

  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" aria-label="Категории">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-pressed={isActive}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-navy-800 text-white shadow'
                : 'bg-white text-navy-700 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

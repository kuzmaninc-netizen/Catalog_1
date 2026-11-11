import { useState } from 'react';

/**
 * Лого на продавницата од `store.logo_url`.
 * Ако нема лого или сликата не се вчита → иницијали.
 */
export default function StoreLogo({ store, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const sizes = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-14 w-14 text-lg',
    lg: 'h-20 w-20 text-2xl',
  };

  const initials = (store?.name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (store?.logo_url && !failed) {
    return (
      <img
        src={store.logo_url}
        alt={`Лого на ${store.name}`}
        onError={() => setFailed(true)}
        className={`${sizes[size]} shrink-0 rounded-2xl bg-white object-cover ring-1 ring-slate-200`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-600 font-semibold text-teal-300`}
    >
      {initials}
    </div>
  );
}

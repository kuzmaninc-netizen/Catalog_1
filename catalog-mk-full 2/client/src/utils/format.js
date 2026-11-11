/** SQLite „YYYY-MM-DD HH:MM:SS“ (UTC) → Date */
export function parseDbDate(value) {
  if (!value) return null;
  const d = new Date(`${String(value).replace(' ', 'T')}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const pad = (n) => String(n).padStart(2, '0');

/** → „12.11.2026 14:05“ */
export function formatDateTime(value) {
  const d = parseDbDate(value);
  if (!d) return '';
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** → „пред 5 мин“, „пред 2 ч“, или датум */
export function formatRelative(value) {
  const d = parseDbDate(value);
  if (!d) return '';
  const diff = Math.round((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'штотуку';
  if (diff < 3600) return `пред ${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `пред ${Math.floor(diff / 3600)} ч`;
  return formatDateTime(value);
}

const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ѓ: 'gj', е: 'e', ж: 'zh', з: 'z', ѕ: 'dz',
  и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', ќ: 'kj', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', џ: 'dj', ш: 'sh',
};

/** „Пекара Жито“ → „pekara-zhito“ (исто како на серверот) */
export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
}

export const ORDER_STATUS = {
  new: { label: 'Нова', className: 'bg-teal-100 text-teal-800 ring-teal-200' },
  confirmed: { label: 'Потврдена', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  delivered: { label: 'Доставена', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
  cancelled: { label: 'Откажана', className: 'bg-red-50 text-red-600 ring-red-200' },
};

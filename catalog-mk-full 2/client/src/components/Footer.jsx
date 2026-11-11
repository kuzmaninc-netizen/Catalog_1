import BrandLogo from './BrandLogo';

export default function Footer({ store }) {
  return (
    <footer className="border-t border-slate-200 bg-white pb-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center md:flex-row md:justify-between md:text-left">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} {store?.name}. Нарачките се обработуваат директно од продавницата.
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Овозможено од</span>
          <BrandLogo />
        </div>
      </div>
    </footer>
  );
}

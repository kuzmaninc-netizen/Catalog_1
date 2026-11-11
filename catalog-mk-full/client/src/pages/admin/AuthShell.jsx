import BrandLogo from '../../components/BrandLogo';

/** Рамка за најава/регистрација. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 md:flex-row">
      <aside className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-navy-800 to-navy-900 p-12 text-white md:flex">
        <div className="inline-flex w-fit rounded-2xl bg-white px-4 py-3">
          <BrandLogo variant="wordmark" />
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Вашиот каталог.
            <br />
            <span className="text-teal-300">Нарачки директно на Viber.</span>
          </h2>
          <p className="mt-4 max-w-md text-navy-100">
            Додајте производи, споделете го линкот и примајте нарачки без провизии и без комплицирани системи.
          </p>
        </div>
        <p className="text-sm text-navy-200">© {new Date().getFullYear()} catalog.mk</p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="mb-8 md:hidden">
          <BrandLogo />
        </div>
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-100 md:p-8">
          <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </main>
    </div>
  );
}

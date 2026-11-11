import BrandLogo from './BrandLogo';

export function LoadingState({ variant = 'store' }) {
  if (variant === 'admin') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <div className="h-40 animate-pulse bg-navy-800/90" />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
            <div className="aspect-square animate-pulse bg-slate-200" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-9 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ title, message, onRetry }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <BrandLogo />
      <h1 className="mt-8 text-xl font-bold text-navy-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-6">
          Обиди се повторно
        </button>
      )}
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return <span className={`${className} inline-block animate-spin rounded-full border-2 border-current border-t-transparent`} />;
}

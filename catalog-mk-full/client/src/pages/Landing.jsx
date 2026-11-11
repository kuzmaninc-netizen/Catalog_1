import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { CartIcon, CheckIcon, ViberIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { title: 'Креирај продавница', text: 'Име, Viber број и линк – за помалку од минута.' },
  { title: 'Додај производи', text: 'Слика, цена и категорија. Сè од телефон.' },
  { title: 'Примај нарачки', text: 'Купувачите нарачуваат, ти добиваш порака на Viber.' },
];

const FEATURES = [
  'Без регистрација за купувачите',
  'Без провизии по нарачка',
  'Сите нарачки зачувани на едно место',
  'Работи одлично на мобилен',
];

export default function Landing() {
  const { status } = useAuth();
  const loggedIn = status === 'authenticated';

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <BrandLogo />
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <Link to="/admin" className="btn-primary px-4 py-2.5">
                Мој панел
              </Link>
            ) : (
              <>
                <Link to="/admin/login" className="btn px-4 py-2.5 text-navy-800 hover:bg-slate-50">
                  Најава
                </Link>
                <Link to="/admin/register" className="btn-primary px-4 py-2.5">
                  Започни
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-navy-800 to-navy-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-200 ring-1 ring-white/15">
              <ViberIcon className="h-4 w-4" /> Нарачки директно на Viber
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              Онлајн каталог за
              <br />
              <span className="text-teal-300">вашата продавница</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-navy-100">
              Направете каталог за неколку минути, споделете го линкот и примајте нарачки преку Viber. Без сложени системи.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={loggedIn ? '/admin' : '/admin/register'} className="btn-teal px-6 py-3.5 text-base">
                {loggedIn ? 'Оди во панелот' : 'Креирај бесплатно'}
              </Link>
              <Link to="/pekara-zito" className="btn px-6 py-3.5 text-base text-white ring-1 ring-white/25 hover:bg-white/10">
                Види пример
              </Link>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-navy-100 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal-300" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Мокап на телефон */}
          <div className="mx-auto w-full max-w-xs">
            <div className="rounded-[2.5rem] bg-navy-900 p-3 shadow-2xl ring-1 ring-white/10">
              <div className="overflow-hidden rounded-[2rem] bg-slate-50">
                <div className="flex items-center gap-2 bg-white px-4 py-3">
                  <img src="/logo-circle.png" alt="" className="h-8 w-8" />
                  <span className="text-sm font-semibold text-navy-900">Вашата продавница</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3">
                  {['bg-teal-100', 'bg-navy-100', 'bg-amber-100', 'bg-rose-100'].map((c, i) => (
                    <div key={c} className="rounded-xl bg-white p-2 ring-1 ring-slate-100">
                      <div className={`aspect-square rounded-lg ${c}`} />
                      <div className="mt-2 h-2 w-3/4 rounded bg-slate-200" />
                      <div className="mt-1.5 text-xs font-bold text-navy-800">{[120, 45, 650, 80][i]} ден.</div>
                    </div>
                  ))}
                </div>
                <div className="m-3 flex items-center gap-2 rounded-xl bg-viber px-3 py-3 text-sm font-semibold text-white">
                  <ViberIcon className="h-5 w-5" /> Нарачај преку Viber
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-center text-2xl font-bold text-navy-900 md:text-3xl">Како функционира?</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 font-bold text-teal-300">{i + 1}</span>
              <h3 className="mt-4 font-semibold text-navy-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to={loggedIn ? '/admin' : '/admin/register'} className="btn-primary px-8 py-3.5 text-base">
            <CartIcon />
            {loggedIn ? 'Оди во панелот' : 'Започни сега'}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} catalog.mk
      </footer>
    </div>
  );
}

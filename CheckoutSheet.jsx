import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  buildOrderMessage,
  buildViberUrl,
  calculateTotals,
  formatPrice,
  isValidMkMobile,
  normalizePhone,
} from '../utils/orderMessage';
import { readStorage, writeStorage } from '../utils/storage';
import {
  ArrowLeftIcon,
  CartIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ViberIcon,
} from './Icons';

const CUSTOMER_KEY = 'catalogmk:customer';
const STEP_CART = 1;
const STEP_DETAILS = 2;
const STEP_SENT = 3;

const EMPTY_CUSTOMER = { name: '', phone: '', address: '', note: '' };

function validate(customer) {
  const errors = {};
  if (customer.name.trim().length < 2) errors.name = 'Внесете име и презиме.';
  if (!normalizePhone(customer.phone)) {
    errors.phone = 'Внесете валиден број, пр. 070 123 456.';
  } else if (!isValidMkMobile(customer.phone) && !customer.phone.trim().startsWith('+')) {
    errors.phone = 'Внесете мобилен број (07X XXX XXX).';
  }
  if (customer.address.trim().length < 5) errors.address = 'Внесете адреса за достава.';
  return errors;
}

/* ------------------------------------------------------------------------ */

function StepIndicator({ step }) {
  const steps = ['Кошничка', 'Податоци'];
  return (
    <ol className="flex items-center gap-2 text-xs font-medium">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                done
                  ? 'bg-teal-400 text-navy-900'
                  : active
                    ? 'bg-navy-800 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? <CheckIcon className="h-3.5 w-3.5" /> : n}
            </span>
            <span className={active || done ? 'text-navy-900' : 'text-slate-400'}>{label}</span>
            {n < steps.length && <span className="h-px w-6 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}

function CartLine({ item, onSetQty, onRemove }) {
  const { product, quantity } = item;
  return (
    <li className="flex gap-3 py-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">
            {product.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-navy-900">{product.name}</p>
          <button
            type="button"
            onClick={onRemove}
            className="-m-1 rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            aria-label={`Отстрани ${product.name}`}
          >
            <TrashIcon />
          </button>
        </div>
        <p className="text-xs text-slate-500">{formatPrice(product.price)}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => onSetQty(quantity - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-navy-800 shadow-sm active:scale-90"
              aria-label="Намали"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => onSetQty(quantity + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-800 text-white shadow-sm active:scale-90"
              aria-label="Зголеми"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm font-bold text-navy-900">{formatPrice(product.price * quantity)}</p>
        </div>
      </div>
    </li>
  );
}

function Totals({ totals, store }) {
  const remainingForFree =
    store.free_delivery_from > 0 && totals.deliveryFee > 0 ? store.free_delivery_from - totals.subtotal : 0;

  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>Меѓузбир ({totals.itemsCount})</span>
        <span>{formatPrice(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>Достава</span>
        <span>{totals.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : 'Бесплатна'}</span>
      </div>
      {remainingForFree > 0 && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800">
          Додајте уште <strong>{formatPrice(remainingForFree)}</strong> за бесплатна достава.
        </p>
      )}
      <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-base font-bold text-navy-900">
        <span>Вкупно</span>
        <span>{formatPrice(totals.total)}</span>
      </div>
    </div>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

export default function CheckoutSheet({ open, onClose, store }) {
  const { items, setQuantity, removeItem, clearCart } = useCart();
  const [step, setStep] = useState(STEP_CART);
  const [customer, setCustomer] = useState(() => ({ ...EMPTY_CUSTOMER, ...readStorage(CUSTOMER_KEY, {}), note: '' }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sentMessage, setSentMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [viberError, setViberError] = useState('');
  const panelRef = useRef(null);

  const totals = useMemo(() => calculateTotals(items, store), [items, store]);
  const belowMinimum = store.min_order > 0 && totals.subtotal < store.min_order;

  // Ресетирај чекор при отворање
  useEffect(() => {
    if (open) {
      setStep(STEP_CART);
      setViberError('');
      setCopied(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Заклучи scroll на позадината + Escape за затворање
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Валидација во живо за веќе допрени полиња
  useEffect(() => {
    const all = validate(customer);
    setErrors(Object.fromEntries(Object.entries(all).filter(([k]) => touched[k])));
  }, [customer, touched]);

  if (!open) return null;

  const updateField = (field) => (e) => setCustomer((c) => ({ ...c, [field]: e.target.value }));
  const touchField = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setViberError('');
    const allErrors = validate(customer);
    setTouched({ name: true, phone: true, address: true });
    setErrors(allErrors);
    if (Object.keys(allErrors).length) return;

    const message = buildOrderMessage(items, customer, totals.total, {
      storeName: store.name,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
    });

    let url;
    try {
      url = buildViberUrl(store.viber_phone || store.phone, message);
    } catch (err) {
      setViberError(err.message);
      return;
    }

    // Запамти ги податоците за следната нарачка (без забелешка)
    writeStorage(CUSTOMER_KEY, {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
    });

    setSentMessage(message);
    setStep(STEP_SENT);

    // Директно отвори ја Viber апликацијата
    window.location.href = url;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sentMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReopenViber = () => {
    try {
      window.location.href = buildViberUrl(store.viber_phone || store.phone, sentMessage);
    } catch (err) {
      setViberError(err.message);
    }
  };

  const handleFinish = () => {
    clearCart();
    setCustomer((c) => ({ ...c, note: '' }));
    setStep(STEP_CART);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
      {/* Позадина */}
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-navy-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Затвори"
        tabIndex={-1}
      />

      {/* Панел: bottom-sheet на мобилен, модал на десктоп */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full animate-slide-up flex-col rounded-t-3xl bg-white shadow-sheet outline-none md:max-h-[88vh] md:max-w-lg md:animate-fade-in md:rounded-3xl"
      >
        {/* Рачка за мобилен */}
        <div className="flex justify-center pt-2.5 md:hidden">
          <span className="h-1.5 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Заглавие */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 pb-4 pt-3 md:pt-5">
          {step === STEP_DETAILS && (
            <button
              type="button"
              onClick={() => setStep(STEP_CART)}
              className="-ml-1 rounded-lg p-1.5 text-navy-700 hover:bg-slate-100"
              aria-label="Назад"
            >
              <ArrowLeftIcon />
            </button>
          )}
          <div className="flex-1">
            <h2 id="checkout-title" className="text-lg font-bold text-navy-900">
              {step === STEP_SENT ? 'Нарачката е подготвена' : 'Брза нарачка'}
            </h2>
            {step !== STEP_SENT && (
              <div className="mt-1.5">
                <StepIndicator step={step} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Затвори"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ЧЕКОР 1: Кошничка */}
        {step === STEP_CART && (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <CartIcon className="h-7 w-7" />
                  </span>
                  <p className="mt-4 font-semibold text-navy-900">Кошничката е празна</p>
                  <p className="mt-1 text-sm text-slate-500">Додајте производи од каталогот.</p>
                  <button type="button" onClick={onClose} className="btn-primary mt-6">
                    Кон каталогот
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <CartLine
                      key={item.product.id}
                      item={item}
                      onSetQty={(q) => setQuantity(item.product.id, q)}
                      onRemove={() => removeItem(item.product.id)}
                    />
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="pb-safe space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 pt-4 md:rounded-b-3xl md:pb-5">
                <Totals totals={totals} store={store} />
                {belowMinimum && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Минималната нарачка е {formatPrice(store.min_order)}. Додајте уште{' '}
                    <strong>{formatPrice(store.min_order - totals.subtotal)}</strong>.
                  </p>
                )}
                <button
                  type="button"
                  disabled={belowMinimum}
                  onClick={() => setStep(STEP_DETAILS)}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  Продолжи кон податоци
                </button>
              </div>
            )}
          </>
        )}

        {/* ЧЕКОР 2: Податоци + Viber */}
        {step === STEP_DETAILS && (
          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <p className="text-sm text-slate-500">Без регистрација. Нарачката ја праќате директно до продавницата преку Viber.</p>

              <Field id="name" label="Име и презиме" error={errors.name}>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="пр. Марија Петровска"
                  value={customer.name}
                  onChange={updateField('name')}
                  onBlur={touchField('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`input ${errors.name ? 'input-error' : ''}`}
                />
              </Field>

              <Field id="phone" label="Мобилен телефон" error={errors.phone}>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="070 123 456"
                  value={customer.phone}
                  onChange={updateField('phone')}
                  onBlur={touchField('phone')}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                />
              </Field>

              <Field id="address" label="Адреса за достава" error={errors.address}>
                <textarea
                  id="address"
                  rows={2}
                  autoComplete="street-address"
                  placeholder="Улица, број, кат/стан, населба"
                  value={customer.address}
                  onChange={updateField('address')}
                  onBlur={touchField('address')}
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? 'address-error' : undefined}
                  className={`input resize-none ${errors.address ? 'input-error' : ''}`}
                />
              </Field>

              <Field id="note" label="Забелешка (опционално)">
                <input
                  id="note"
                  type="text"
                  placeholder="пр. ѕвонете на интерфон 12"
                  value={customer.note}
                  onChange={updateField('note')}
                  className="input"
                />
              </Field>
            </div>

            <div className="pb-safe space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 pt-4 md:rounded-b-3xl md:pb-5">
              <Totals totals={totals} store={store} />
              {viberError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{viberError}</p>}
              <button type="submit" className="btn-viber w-full py-3.5 text-base">
                <ViberIcon className="h-5 w-5" />
                Нарачај преку Viber
              </button>
            </div>
          </form>
        )}

        {/* ЧЕКОР 3: Испратено */}
        {step === STEP_SENT && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <CheckIcon className="h-7 w-7" />
                </span>
                <p className="mt-3 font-semibold text-navy-900">Viber се отвора…</p>
                <p className="mt-1 text-sm text-slate-500">
                  Притиснете <strong>Испрати</strong> во Viber за да ја потврдите нарачката кај {store.name}.
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Порака</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-navy-700 hover:bg-white"
                  >
                    {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                    {copied ? 'Копирано' : 'Копирај'}
                  </button>
                </div>
                <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-navy-800">
                  {sentMessage}
                </pre>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                Viber не се отвори? Копирајте ја пораката и испратете ја на{' '}
                <strong className="text-navy-800">{store.viber_phone_display || store.phone_display}</strong>.
              </p>
              {viberError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{viberError}</p>}
            </div>

            <div className="pb-safe grid grid-cols-2 gap-3 border-t border-slate-100 px-5 pt-4 md:pb-5">
              <button type="button" onClick={handleReopenViber} className="btn-ghost">
                <ViberIcon className="h-4 w-4 text-viber" />
                Отвори пак
              </button>
              <button type="button" onClick={handleFinish} className="btn-primary">
                Готово
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

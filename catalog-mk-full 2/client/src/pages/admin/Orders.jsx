import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Alert } from '../../components/admin/FormField';
import { PhoneIcon, PinIcon, ViberIcon } from '../../components/Icons';
import { Spinner } from '../../components/StateViews';
import { formatDateTime, formatRelative, ORDER_STATUS } from '../../utils/format';
import { formatPrice } from '../../utils/orderMessage';

const FILTERS = [
  { key: '', label: 'Сите' },
  { key: 'new', label: 'Нови' },
  { key: 'confirmed', label: 'Потврдени' },
  { key: 'delivered', label: 'Доставени' },
  { key: 'cancelled', label: 'Откажани' },
];

const NEXT_ACTIONS = {
  new: [
    { status: 'confirmed', label: 'Потврди', className: 'btn-primary' },
    { status: 'cancelled', label: 'Откажи', className: 'btn-ghost text-red-600' },
  ],
  confirmed: [
    { status: 'delivered', label: 'Доставено', className: 'btn-teal' },
    { status: 'cancelled', label: 'Откажи', className: 'btn-ghost text-red-600' },
  ],
  delivered: [],
  cancelled: [{ status: 'new', label: 'Врати во нови', className: 'btn-ghost' }],
};

const PAGE = 20;
const REFRESH_MS = 30_000;

function StatCard({ label, value, accent = false }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${accent ? 'bg-navy-800 text-white ring-navy-800' : 'bg-white ring-slate-100'}`}>
      <p className={`text-xs ${accent ? 'text-navy-100' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-1 text-xl font-bold md:text-2xl">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.new;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.className}`}>{s.label}</span>;
}

function OrderCard({ order, onStatus, busy }) {
  const { customer } = order;
  return (
    <article className={`rounded-2xl bg-white p-4 shadow-card ring-1 md:p-5 ${order.status === 'new' ? 'ring-teal-300' : 'ring-slate-100'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-bold text-navy-900">Нарачка #{order.order_number}</p>
          <p className="text-xs text-slate-500" title={formatDateTime(order.created_at)}>
            {formatRelative(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 text-sm">
          <p className="font-semibold text-navy-900">{customer.name}</p>
          <p className="flex items-center gap-2 text-slate-600">
            <PhoneIcon className="h-4 w-4 text-slate-400" />
            <a href={`tel:+${customer.phone}`} className="hover:underline">
              {customer.phone_display}
            </a>
            <a href={`viber://chat?number=${customer.phone}`} className="text-viber" aria-label="Пиши на Viber">
              <ViberIcon className="h-4 w-4" />
            </a>
          </p>
          <p className="flex items-start gap-2 text-slate-600">
            <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {customer.address}
          </p>
          {customer.note && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">📝 {customer.note}</p>}
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <ul className="space-y-1">
            {order.items.map((item) => (
              <li key={item.product_id} className="flex justify-between gap-2">
                <span className="text-navy-800">
                  {item.quantity}
                  {item.unit && item.unit !== 'парче' ? ` ${item.unit}` : '×'} {item.name}
                </span>
                <span className="shrink-0 text-slate-600">{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-0.5 border-t border-dashed border-slate-200 pt-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Достава</span>
              <span>{order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'бесплатна'}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-navy-900">
              <span>Вкупно</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {NEXT_ACTIONS[order.status]?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {NEXT_ACTIONS[order.status].map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={busy}
              onClick={() => onStatus(order, action.status)}
              className={`${action.className} px-4 py-2`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export default function Orders() {
  const [filter, setFilter] = useState('new');
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const [list, s] = await Promise.all([
          adminApi.listOrders({ status: filter || undefined, limit: PAGE, offset: 0 }),
          adminApi.stats(),
        ]);
        setOrders(list.orders);
        setTotal(list.total);
        setStats(s);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    load();
    const t = setInterval(() => load({ silent: true }), REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const list = await adminApi.listOrders({ status: filter || undefined, limit: PAGE, offset: orders.length });
      setOrders((o) => [...o, ...list.orders]);
      setTotal(list.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const changeStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      const { order: updated } = await adminApi.updateOrderStatus(order.id, status);
      setOrders((list) =>
        filter && updated.status !== filter
          ? list.filter((o) => o.id !== updated.id)
          : list.map((o) => (o.id === updated.id ? updated : o)),
      );
      if (filter && updated.status !== filter) setTotal((t) => Math.max(0, t - 1));
      adminApi.stats().then(setStats).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-navy-900">Нарачки</h1>

      {stats && (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Нови нарачки" value={stats.new_orders} accent />
          <StatCard label="Денес" value={stats.today_orders} />
          <StatCard label="Промет денес" value={formatPrice(stats.today_revenue)} />
          <StatCard label="Промет 30 дена" value={formatPrice(stats.month_revenue)} />
        </div>
      )}

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.key ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 ring-1 ring-slate-200'
            }`}
          >
            {f.label}
            {f.key === 'new' && stats?.new_orders > 0 ? ` (${stats.new_orders})` : ''}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Alert>{error}</Alert>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-navy-800">
          <Spinner className="h-8 w-8" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-slate-100">
          <p className="font-semibold text-navy-900">Нема нарачки</p>
          <p className="mt-1 text-sm text-slate-500">Споделете го линкот од каталогот за да почнете да примате нарачки.</p>
        </div>
      ) : (
        <div className="mt-2 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onStatus={changeStatus} busy={busyId === order.id} />
          ))}
          {orders.length < total && (
            <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-ghost w-full">
              {loadingMore && <Spinner />}
              Вчитај повеќе ({total - orders.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

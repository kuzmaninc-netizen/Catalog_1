/**
 * Мали inline SVG икони (без надворешни библиотеки).
 */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const CartIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2.5 3h2.6l2.3 11.2a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.5L21.5 7H6" />
  </svg>
);

export const PlusIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M5 12h14" />
  </svg>
);

export const CloseIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const TrashIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

export const ArrowLeftIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const PhoneIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);

export const PinIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ClockIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export const SearchIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const CheckIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const CopyIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const ViberIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M11.4 1C8.5 1 3.2 1.4.9 3.6-.7 5.2-.3 9 .1 11.3c.3 2 1.2 5.2 3.7 6.7v3.3s0 1.3.9 1.6c1 .3 1.6-.6 2.5-1.6l1.6-1.8c2.6.2 6.5 0 9.4-1.2 3.6-1.4 4.4-6 4.6-8.4.3-3.2-.3-6.6-2.5-8.2C18.3.9 14.3 1 11.4 1Zm.1 1.8c2.5 0 5.9 0 7.6 1.3 1.7 1.3 2.1 4.2 1.9 6.8-.2 2-.8 5.7-3.6 6.8-2.5 1-5.8 1.2-8.3 1l-2.7 2.9v-2.6l-.3-.1c-2-1.2-2.8-4-3-5.6-.4-1.9-.7-5.1.6-6.4C5.5 3.2 9.3 2.8 11.5 2.8Zm.4 2.3a.5.5 0 0 0 0 1c1.4 0 2.7.5 3.6 1.4.9.9 1.4 2.2 1.4 3.7a.5.5 0 1 0 1 0c0-1.7-.6-3.2-1.7-4.4-1.1-1.1-2.6-1.7-4.3-1.7Zm-3.8.6c-.3 0-.6 0-.8.2-.5.4-1 .9-1 1.5 0 .3.1.5.2.8.6 1.4 1.4 2.7 2.5 3.9 1.3 1.4 2.9 2.5 4.6 3.2.3.1.5.2.8.2.6 0 1.1-.6 1.5-1 .3-.4.3-.9-.1-1.2l-1.4-1c-.4-.3-1-.3-1.3.1l-.4.5c-.2.2-.5.3-.8.2-1.3-.6-2.4-1.6-3-2.9-.1-.3 0-.6.2-.8l.5-.4c.4-.3.4-.9.1-1.3l-1-1.4c-.1-.2-.4-.4-.6-.4Zm4.1.9a.5.5 0 0 0 0 1c.6 0 1.1.2 1.5.6.4.4.6 1 .6 1.6a.5.5 0 1 0 1 0c0-.9-.3-1.7-.9-2.3-.6-.6-1.3-.9-2.2-.9Zm.2 1.8a.5.5 0 0 0 0 1c.3 0 .4.2.4.5a.5.5 0 1 0 1 0c0-.8-.6-1.5-1.4-1.5Z" />
  </svg>
);

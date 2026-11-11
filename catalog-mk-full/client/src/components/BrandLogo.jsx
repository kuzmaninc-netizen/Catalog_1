import { Link } from 'react-router-dom';

/**
 * Лого на платформата catalog.mk
 *  - Мобилен: кружно лого (logo-circle.png)
 *  - Десктоп (md+): текстуално лого (logo-wordmark.png)
 *  - variant="wordmark" → секогаш текстуално лого
 */
export default function BrandLogo({ className = '', to = '/', variant = 'responsive' }) {
  if (variant === 'wordmark') {
    return (
      <Link to={to} className={`inline-flex shrink-0 items-center ${className}`} aria-label="catalog.mk">
        <img src="/logo-wordmark.png" alt="catalog.mk" width="160" height="27" className="h-7 w-auto" />
      </Link>
    );
  }

  return (
    <Link to={to} className={`inline-flex shrink-0 items-center ${className}`} aria-label="catalog.mk">
      <img src="/logo-circle.png" alt="catalog.mk" width="40" height="40" className="h-10 w-10 md:hidden" />
      <img
        src="/logo-wordmark.png"
        alt="catalog.mk"
        width="132"
        height="22"
        className="hidden h-[22px] w-auto md:block"
      />
    </Link>
  );
}

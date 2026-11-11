import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '..');

const resolveFromRoot = (p) => (path.isAbsolute(p) ? p : path.resolve(SERVER_ROOT, p));

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || 'dev-only-secret-change-me-dev-only-secret';

if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET мора да биде поставен (мин. 32 знаци) во продукција.');
}

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  jwtExpiresDays: Number(process.env.JWT_EXPIRES_DAYS) || 30,
  dbPath: resolveFromRoot(process.env.DB_PATH || './data/catalog.db'),
  uploadDir: resolveFromRoot(process.env.UPLOAD_DIR || './uploads'),
  clientDist: resolveFromRoot(process.env.CLIENT_DIST || '../client/dist'),
  maxUploadBytes: 5 * 1024 * 1024,
  // Број на прокси скокови пред серверот (Render = 1, Netlify прокси + Render = 2)
  trustProxy: Number.isInteger(Number(process.env.TRUST_PROXY)) && process.env.TRUST_PROXY !== ''
    ? Number(process.env.TRUST_PROXY)
    : 1,
};

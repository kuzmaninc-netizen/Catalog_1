import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config } from './config.js';
import { createServices } from './services/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

export function createApp(db) {
  const app = express();
  app.locals.services = createServices(db);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Основни безбедносни заглавја
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '200kb' }));

  // Прикачени слики
  app.use(
    '/uploads',
    express.static(config.uploadDir, {
      maxAge: '30d',
      immutable: true,
      fallthrough: false,
      setHeaders: (res) => res.setHeader('Content-Security-Policy', "default-src 'none'"),
    }),
  );

  // API
  app.get('/api/health', (_req, res) => res.json({ ok: true, data: { status: 'up' } }));
  app.use('/api/public', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', notFoundHandler);

  // Продукција: сервирај го build-от на фронтендот (SPA)
  const indexHtml = path.join(config.clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(config.clientDist, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(indexHtml));
  }

  app.use(errorHandler);
  return app;
}

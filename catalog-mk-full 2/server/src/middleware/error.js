import multer from 'multer';
import { HttpError } from '../utils/http.js';

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Рутата ${req.method} ${req.originalUrl} не постои.`, 'NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = 500;
  let body = { code: 'INTERNAL_ERROR', message: 'Внатрешна грешка на серверот.' };

  if (err instanceof HttpError) {
    status = err.status;
    body = { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) };
  } else if (err instanceof multer.MulterError) {
    status = 400;
    body = {
      code: 'UPLOAD_ERROR',
      message: err.code === 'LIMIT_FILE_SIZE' ? 'Сликата е преголема (макс. 5 MB).' : 'Грешка при прикачување.',
    };
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    body = { code: 'INVALID_JSON', message: 'Невалиден JSON.' };
  } else if (err?.type === 'entity.too.large') {
    status = 413;
    body = { code: 'PAYLOAD_TOO_LARGE', message: 'Барањето е преголемо.' };
  } else if (Number.isInteger(err?.status) && err.status >= 400 && err.status < 500) {
    // пр. 404 од express.static за непостоечка слика
    status = err.status;
    body = { code: status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST', message: status === 404 ? 'Не е пронајдено.' : 'Невалидно барање.' };
  }

  if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(status).json({ ok: false, error: body });
}

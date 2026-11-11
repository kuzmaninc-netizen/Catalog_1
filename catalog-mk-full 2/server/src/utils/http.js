export class HttpError extends Error {
  constructor(status, message, code = 'ERROR', details = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, 'VALIDATION_ERROR', details);
export const unauthorized = (message = 'Потребна е најава.') => new HttpError(401, message, 'UNAUTHORIZED');
export const notFound = (message = 'Не е пронајдено.') => new HttpError(404, message, 'NOT_FOUND');
export const conflict = (message) => new HttpError(409, message, 'CONFLICT');

/** Обвивка за async рути – грешките одат во error middleware. */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

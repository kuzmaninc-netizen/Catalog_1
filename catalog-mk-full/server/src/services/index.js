import { createAuthService } from './authService.js';
import { createOrderService } from './orderService.js';
import { createProductService } from './productService.js';
import { createStoreService } from './storeService.js';

export function createServices(db) {
  return {
    auth: createAuthService(db),
    stores: createStoreService(db),
    products: createProductService(db),
    orders: createOrderService(db),
  };
}

// Event types for microservice communication
export const EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_STOCK_UPDATED: 'product.stock.updated',
  
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_COMPLETED: 'order.completed',
  
  CART_ITEM_ADDED: 'cart.item.added',
  CART_ITEM_REMOVED: 'cart.item.removed',
  CART_CLEARED: 'cart.cleared'
};

// Queue names for different services
export const QUEUES = {
  AUTH_EVENTS: 'auth-events',
  PRODUCT_EVENTS: 'product-events',
  ORDER_EVENTS: 'order-events',
  NOTIFICATION_EVENTS: 'notification-events'
};

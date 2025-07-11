const MessageQueue = require('../../shared/messageQueue');
const { EVENTS, QUEUES } = require('../../shared/events');

class MessageService {
  constructor() {
    this.messageQueue = new MessageQueue();
  }

  async init() {
    await this.messageQueue.connect();
    this.setupEventListeners();
  }

  async publishOrderCreated(orderData) {
    const event = {
      type: EVENTS.ORDER_CREATED,
      data: {
        orderId: orderData._id.toString(),
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.ORDER_EVENTS, event);
  }

  async publishOrderUpdated(orderData) {
    const event = {
      type: EVENTS.ORDER_UPDATED,
      data: {
        orderId: orderData._id.toString(),
        userId: orderData.userId,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.ORDER_EVENTS, event);
  }

  async publishOrderCompleted(orderData) {
    const event = {
      type: EVENTS.ORDER_COMPLETED,
      data: {
        orderId: orderData._id.toString(),
        userId: orderData.userId,
        userEmail: orderData.userEmail,
        totalAmount: orderData.totalAmount,
        items: orderData.items,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.ORDER_EVENTS, event);
  }

  async publishOrderCancelled(orderData) {
    const event = {
      type: EVENTS.ORDER_CANCELLED,
      data: {
        orderId: orderData._id.toString(),
        userId: orderData.userId,
        items: orderData.items,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.ORDER_EVENTS, event);
  }

  setupEventListeners() {
    // Listen for user events
    this.messageQueue.consume(QUEUES.AUTH_EVENTS, (event, ack) => {
      console.log('Order Service received auth event:', event);
      
      switch (event.type) {
        case EVENTS.USER_CREATED:
          this.handleUserCreated(event.data);
          break;
        case EVENTS.USER_UPDATED:
          this.handleUserUpdated(event.data);
          break;
        case EVENTS.USER_DELETED:
          this.handleUserDeleted(event.data);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }
      
      ack();
    });

    // Listen for product events
    this.messageQueue.consume(QUEUES.PRODUCT_EVENTS, (event, ack) => {
      console.log('Order Service received product event:', event);
      
      switch (event.type) {
        case EVENTS.PRODUCT_UPDATED:
          this.handleProductUpdated(event.data);
          break;
        case EVENTS.PRODUCT_DELETED:
          this.handleProductDeleted(event.data);
          break;
        case EVENTS.PRODUCT_STOCK_UPDATED:
          this.handleProductStockUpdated(event.data);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }
      
      ack();
    });
  }

  async handleUserCreated(userData) {
    console.log(`New user registered: ${userData.email}`);
    // Could send welcome email, setup user preferences, etc.
  }

  async handleUserUpdated(userData) {
    console.log(`User updated: ${userData.email}`);
    // Update user info in orders if needed
  }

  async handleUserDeleted(userData) {
    console.log(`User deleted: ${userData.userId}`);
    // Handle user deletion - maybe cancel pending orders
  }

  async handleProductUpdated(productData) {
    console.log(`Product updated: ${productData.name}`);
    // Update product info in existing orders if needed
  }

  async handleProductDeleted(productData) {
    console.log(`Product deleted: ${productData.productId}`);
    // Handle product deletion - notify about orders with this product
  }

  async handleProductStockUpdated(productData) {
    console.log(`Product stock updated: ${productData.name}, stock: ${productData.stock}`);
    // Check if any pending orders can be fulfilled
  }
}

module.exports = MessageService;

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

  async publishUserCreated(userData) {
    const event = {
      type: EVENTS.USER_CREATED,
      data: {
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.AUTH_EVENTS, event);
  }

  async publishUserUpdated(userData) {
    const event = {
      type: EVENTS.USER_UPDATED,
      data: {
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.AUTH_EVENTS, event);
  }

  async publishUserDeleted(userId) {
    const event = {
      type: EVENTS.USER_DELETED,
      data: {
        userId,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.AUTH_EVENTS, event);
  }

  setupEventListeners() {
    // Listen for order events to update user data if needed
    this.messageQueue.consume(QUEUES.ORDER_EVENTS, (event, ack) => {
      console.log('Auth Service received order event:', event);
      
      switch (event.type) {
        case EVENTS.ORDER_CREATED:
          this.handleOrderCreated(event.data);
          break;
        case EVENTS.ORDER_COMPLETED:
          this.handleOrderCompleted(event.data);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }
      
      ack();
    });

    // Listen for product events
    this.messageQueue.consume(QUEUES.PRODUCT_EVENTS, (event, ack) => {
      console.log('Auth Service received product event:', event);
      
      switch (event.type) {
        case EVENTS.PRODUCT_CREATED:
          this.handleProductCreated(event.data);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }
      
      ack();
    });
  }

  async handleOrderCreated(orderData) {
    console.log(`User ${orderData.userId} created order ${orderData.orderId}`);
    // Could update user statistics, loyalty points, etc.
  }

  async handleOrderCompleted(orderData) {
    console.log(`Order ${orderData.orderId} completed for user ${orderData.userId}`);
    // Could award loyalty points, send notifications, etc.
  }

  async handleProductCreated(productData) {
    console.log(`New product created: ${productData.name}`);
    // Could update user preferences, send notifications to interested users, etc.
  }
}

module.exports = MessageService;

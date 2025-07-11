import { MessageQueue } from '../shared/messageQueue';
import { EVENTS, QUEUES } from '../shared/events';

export class MessageService {
  private messageQueue: MessageQueue;

  constructor() {
    this.messageQueue = new MessageQueue();
  }

  async init(): Promise<void> {
    await this.messageQueue.connect();
    this.setupEventListeners();
  }

  async publishProductCreated(productData: any): Promise<void> {
    const event = {
      type: EVENTS.PRODUCT_CREATED,
      data: {
        productId: productData._id.toString(),
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        category: productData.category,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.PRODUCT_EVENTS, event);
  }

  async publishProductUpdated(productData: any): Promise<void> {
    const event = {
      type: EVENTS.PRODUCT_UPDATED,
      data: {
        productId: productData._id.toString(),
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
        category: productData.category,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.PRODUCT_EVENTS, event);
  }

  async publishProductDeleted(productId: string): Promise<void> {
    const event = {
      type: EVENTS.PRODUCT_DELETED,
      data: {
        productId,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.PRODUCT_EVENTS, event);
  }

  async publishProductStockUpdated(productData: any): Promise<void> {
    const event = {
      type: EVENTS.PRODUCT_STOCK_UPDATED,
      data: {
        productId: productData._id.toString(),
        name: productData.name,
        stock: productData.stock,
        timestamp: new Date().toISOString()
      }
    };

    await this.messageQueue.publish(QUEUES.PRODUCT_EVENTS, event);
  }

  private setupEventListeners(): void {
    // Listen for user events
    this.messageQueue.consume(QUEUES.AUTH_EVENTS, (event, ack) => {
      console.log('Product Service received auth event:', event);
      
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

    // Listen for order events
    this.messageQueue.consume(QUEUES.ORDER_EVENTS, (event, ack) => {
      console.log('Product Service received order event:', event);
      
      switch (event.type) {
        case EVENTS.ORDER_CREATED:
          this.handleOrderCreated(event.data);
          break;
        case EVENTS.ORDER_CANCELLED:
          this.handleOrderCancelled(event.data);
          break;
        case EVENTS.ORDER_COMPLETED:
          this.handleOrderCompleted(event.data);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }
      
      ack();
    });
  }

  private async handleUserCreated(userData: any): Promise<void> {
    console.log(`New user registered: ${userData.email}`);
    // Could update user preferences, recommend products, etc.
  }

  private async handleUserUpdated(userData: any): Promise<void> {
    console.log(`User updated: ${userData.email}`);
    // Update user preferences if needed
  }

  private async handleUserDeleted(userData: any): Promise<void> {
    console.log(`User deleted: ${userData.userId}`);
    // Clean up user-related data
  }

  private async handleOrderCreated(orderData: any): Promise<void> {
    console.log(`Order created: ${orderData.orderId}`);
    // Update product stock levels
    for (const item of orderData.items) {
      console.log(`Reducing stock for product ${item.productId} by ${item.quantity}`);
      // Here you would update the actual product stock in your database
    }
  }

  private async handleOrderCancelled(orderData: any): Promise<void> {
    console.log(`Order cancelled: ${orderData.orderId}`);
    // Restore product stock levels
    for (const item of orderData.items) {
      console.log(`Restoring stock for product ${item.productId} by ${item.quantity}`);
      // Here you would restore the product stock in your database
    }
  }

  private async handleOrderCompleted(orderData: any): Promise<void> {
    console.log(`Order completed: ${orderData.orderId}`);
    // Update product analytics, popular products, etc.
  }
}

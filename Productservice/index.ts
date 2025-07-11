import { Hono } from 'hono';
import productRouter from './Routers/productRoutes';
import connect from './connectivity/connection';
import { MessageService } from './services/messageService';

const app = new Hono();
const messageService = new MessageService();

// Initialize services
const initializeServices = async () => {
  try {
    await connect();
    await messageService.init();
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Initialize services
initializeServices();

app.route('/api', productRouter);
app.get('/', (c) => c.text('Welcome to the Product Service!'));

Bun.serve({
  port: 5000,
  fetch: app.fetch,
});

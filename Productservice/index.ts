import { Hono } from 'hono';
import productRouter from './Routers/product'; // assuming you're using ES modules
import connect from './connectivity/connection'; // assuming you're using ES modules
const app = new Hono();
connect()
app.route('/product', productRouter);
app.get('/', (c) => c.text('Welcome to the Product Service!'));

Bun.serve({
  port: 5000,
  fetch: app.fetch,
});

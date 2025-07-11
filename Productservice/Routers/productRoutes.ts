import { Hono } from 'hono';
import { 
  addProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  updateProductStock,
  getHealthCheck 
} from '../Controller/productController';

const productRouter = new Hono();

productRouter.get('/', getHealthCheck);
productRouter.get('/products', getProducts);
productRouter.get('/products/:id', getProductById);
productRouter.post('/products', addProduct);
productRouter.put('/products/:id', updateProduct);
productRouter.delete('/products/:id', deleteProduct);
productRouter.patch('/products/:id/stock', updateProductStock);

export default productRouter;

import { Hono } from 'hono';
import * as productcontroller from '../Controller/product.js'; // assuming ES modules

const productRouter = new Hono();

productRouter.post('/add', productcontroller.addproduct);
productRouter.get('/get', productcontroller.getproduct);
productRouter.get('/getall', productcontroller.getallproducts);
productRouter.get('/get/:id', productcontroller.getproductbyid);
productRouter.put('/update/:id', productcontroller.updateproduct);
productRouter.delete('/delete/:id', productcontroller.deleteproduct);
productRouter.get('/dummy', productcontroller.getdata);

export default productRouter;

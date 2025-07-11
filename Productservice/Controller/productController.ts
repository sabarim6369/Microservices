import { Context } from 'hono';
import Product from '../models/Product';
import { MessageService } from '../services/messageService';

const messageService = new MessageService();

export const addProduct = async (c: Context) => {
  try {
    const { name, price, description, category, stock, imageUrl } = await c.req.json();
    
    if (!name || !price || !description || !category) {
      return c.json({ error: 'Name, price, description, and category are required' }, 400);
    }

    const product = new Product({
      name,
      price,
      description,
      category,
      stock: stock || 0,
      imageUrl: imageUrl || ''
    });

    const savedProduct = await product.save();
    
    // Publish product created event
    try {
      await messageService.publishProductCreated(savedProduct);
    } catch (msgError) {
      console.error('Failed to publish product created event:', msgError);
    }

    return c.json({ 
      message: 'Product created successfully', 
      product: savedProduct 
    }, 201);
  } catch (error) {
    console.error('Add product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getProducts = async (c: Context) => {
  try {
    const { category, search } = c.req.query();
    
    let filter: any = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return c.json({ products }, 200);
  } catch (error) {
    console.error('Get products error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getProductById = async (c: Context) => {
  try {
    const productId = c.req.param('id');
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({ product }, 200);
  } catch (error) {
    console.error('Get product by ID error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updateProduct = async (c: Context) => {
  try {
    const productId = c.req.param('id');
    const { name, price, description, category, stock, imageUrl } = await c.req.json();
    
    const product = await Product.findById(productId);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Update fields if provided
    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    const updatedProduct = await product.save();
    
    // Publish product updated event
    try {
      await messageService.publishProductUpdated(updatedProduct);
    } catch (msgError) {
      console.error('Failed to publish product updated event:', msgError);
    }

    return c.json({ 
      message: 'Product updated successfully', 
      product: updatedProduct 
    }, 200);
  } catch (error) {
    console.error('Update product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const deleteProduct = async (c: Context) => {
  try {
    const productId = c.req.param('id');
    
    const product = await Product.findById(productId);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    await Product.findByIdAndDelete(productId);
    
    // Publish product deleted event
    try {
      await messageService.publishProductDeleted(productId);
    } catch (msgError) {
      console.error('Failed to publish product deleted event:', msgError);
    }

    return c.json({ 
      message: 'Product deleted successfully', 
      product 
    }, 200);
  } catch (error) {
    console.error('Delete product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updateProductStock = async (c: Context) => {
  try {
    const productId = c.req.param('id');
    const { stock } = await c.req.json();
    
    if (stock === undefined || stock < 0) {
      return c.json({ error: 'Valid stock quantity is required' }, 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    product.stock = stock;
    const updatedProduct = await product.save();
    
    // Publish product stock updated event
    try {
      await messageService.publishProductStockUpdated(updatedProduct);
    } catch (msgError) {
      console.error('Failed to publish product stock updated event:', msgError);
    }

    return c.json({ 
      message: 'Product stock updated successfully', 
      product: updatedProduct 
    }, 200);
  } catch (error) {
    console.error('Update product stock error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const getHealthCheck = async (c: Context) => {
  return c.json({ message: "Hello from Product Service!" }, 200);
};

const Order = require('../models/Order');
const MessageService = require('../services/messageService');

const messageService = new MessageService();

exports.createOrder = async (req, res) => {
  try {
    const { userId, userEmail, items, shippingAddress } = req.body;
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = new Order({
      userId,
      userEmail,
      items,
      totalAmount,
      shippingAddress,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedOrder = await order.save();
    
    // Publish order created event
    try {
      await messageService.publishOrderCreated(savedOrder);
    } catch (msgError) {
      console.error('Failed to publish order created event:', msgError);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    const updatedOrder = await order.save();
    
    // Publish appropriate events
    try {
      await messageService.publishOrderUpdated(updatedOrder);
      
      if (status === 'delivered') {
        await messageService.publishOrderCompleted(updatedOrder);
      } else if (status === 'cancelled') {
        await messageService.publishOrderCancelled(updatedOrder);
      }
    } catch (msgError) {
      console.error('Failed to publish order update event:', msgError);
    }
    
    res.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({ error: 'Cannot cancel order that has been shipped or delivered' });
    }
    
    order.status = 'cancelled';
    const updatedOrder = await order.save();
    
    // Publish order cancelled event
    try {
      await messageService.publishOrderCancelled(updatedOrder);
    } catch (msgError) {
      console.error('Failed to publish order cancelled event:', msgError);
    }
    
    res.json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

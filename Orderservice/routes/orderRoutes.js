const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/create', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId/status', orderController.updateOrderStatus);
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;

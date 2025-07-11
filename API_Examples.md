# Microservice API Examples

This document shows how to use the microservice APIs and see RabbitMQ communication in action.

## Services Overview

- **Auth Service**: Port 3001 - User authentication and management
- **Product Service**: Port 5000 - Product catalog management
- **Order Service**: Port 4000 - Order processing and management
- **RabbitMQ**: Port 5672 (AMQP), Port 15672 (Management UI)

## Starting the Services

```bash
# Start all services with Docker Compose
docker-compose up --build

# Or start individual services for development
cd Authservice && npm run dev
cd Productservice && bun run index.ts
cd Orderservice && npm run dev
```

## API Examples

### Auth Service (Port 3001)

#### 1. Create User (Publishes USER_CREATED event)
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Login User
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Product Service (Port 5000)

#### 1. Create Product (Publishes PRODUCT_CREATED event)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "description": "High-performance laptop",
    "category": "Electronics",
    "stock": 50
  }'
```

#### 2. Get All Products
```bash
curl -X GET http://localhost:5000/api/products
```

#### 3. Update Product Stock (Publishes PRODUCT_STOCK_UPDATED event)
```bash
curl -X PATCH http://localhost:5000/api/products/PRODUCT_ID/stock \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 45
  }'
```

### Order Service (Port 4000)

#### 1. Create Order (Publishes ORDER_CREATED event)
```bash
curl -X POST http://localhost:4000/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "userEmail": "john@example.com",
    "items": [
      {
        "productId": "PRODUCT_ID",
        "productName": "Laptop",
        "quantity": 1,
        "price": 999.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

#### 2. Get Orders
```bash
curl -X GET http://localhost:4000/orders?userId=USER_ID
```

#### 3. Update Order Status (Publishes ORDER_UPDATED event)
```bash
curl -X PUT http://localhost:4000/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped"
  }'
```

## RabbitMQ Events Flow

### Event Flow Examples:

1. **User Registration Flow**:
   - User signs up via Auth Service
   - Auth Service publishes `USER_CREATED` event
   - Product Service and Order Service receive the event
   - Services can update user preferences, recommendations, etc.

2. **Product Creation Flow**:
   - Product created via Product Service
   - Product Service publishes `PRODUCT_CREATED` event
   - Auth Service and Order Service receive the event
   - Services can notify users, update catalogs, etc.

3. **Order Processing Flow**:
   - Order created via Order Service
   - Order Service publishes `ORDER_CREATED` event
   - Product Service receives event and updates stock
   - Auth Service receives event and can update user statistics

4. **Stock Management Flow**:
   - Product stock updated via Product Service
   - Product Service publishes `PRODUCT_STOCK_UPDATED` event
   - Order Service receives event and can process pending orders

## Monitoring RabbitMQ

1. **Access RabbitMQ Management UI**:
   - URL: http://localhost:15672
   - Username: admin
   - Password: password

2. **View Queues**:
   - auth-events
   - product-events
   - order-events
   - notification-events

3. **Monitor Message Flow**:
   - Check queue lengths
   - View message rates
   - Monitor consumer activity

## Testing Inter-Service Communication

### Test Scenario 1: Complete User Journey
```bash
# 1. Create user
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "test123"}')

# 2. Login to get token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}')

# 3. Create product
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 29.99, "description": "Test product", "category": "Test", "stock": 100}')

# 4. Create order
ORDER_RESPONSE=$(curl -s -X POST http://localhost:4000/orders/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "userEmail": "test@example.com", "items": [{"productId": "test-product-id", "productName": "Test Product", "quantity": 2, "price": 29.99}]}')
```

### Test Scenario 2: Stock Management
```bash
# 1. Check initial stock
curl -X GET http://localhost:5000/api/products/PRODUCT_ID

# 2. Create order (should trigger stock reduction)
curl -X POST http://localhost:4000/orders/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "userEmail": "user@example.com", "items": [{"productId": "PRODUCT_ID", "productName": "Product", "quantity": 5, "price": 29.99}]}'

# 3. Check updated stock (should be reduced)
curl -X GET http://localhost:5000/api/products/PRODUCT_ID

# 4. Cancel order (should restore stock)
curl -X PUT http://localhost:4000/orders/ORDER_ID/cancel
```

## Environment Variables

Create `.env` files for each service:

### Auth Service (.env)
```
PORT=3001
RABBITMQ_URL=amqp://admin:password@localhost:5672
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=your-database-url
```

### Product Service (.env)
```
PORT=5000
RABBITMQ_URL=amqp://admin:password@localhost:5672
MONGODB_URI=mongodb://localhost:27017/productservice
```

### Order Service (.env)
```
PORT=4000
RABBITMQ_URL=amqp://admin:password@localhost:5672
MONGODB_URI=mongodb://localhost:27017/orderservice
```

## Logs to Watch

When running the services, watch the logs to see RabbitMQ events:

```bash
# Watch all services
docker-compose logs -f

# Watch specific service
docker-compose logs -f auth-service
docker-compose logs -f product-service
docker-compose logs -f order-service
```

Look for messages like:
- "Message published to auth-events"
- "Message received from product-events"
- "Auth Service received order event"
- "Product Service received auth event"

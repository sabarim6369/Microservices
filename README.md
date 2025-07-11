# Microservices Architecture with RabbitMQ

A complete microservices architecture demo using RabbitMQ for inter-service communication.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │ Product Service │    │  Order Service  │
│   (Node.js)     │    │   (Bun/Hono)    │    │   (Node.js)     │
│   Port: 3001    │    │   Port: 5000    │    │   Port: 4000    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      RabbitMQ Server      │
                    │       Port: 5672         │
                    │   Management: 15672      │
                    └───────────────────────────┘
```

## Services Description

### 1. Auth Service (Port 3001)
- **Technology**: Node.js + Express + Prisma
- **Database**: PostgreSQL/SQLite
- **Features**:
  - User registration and authentication
  - JWT token generation
  - User profile management
  - Publishes user events (created, updated, deleted)

### 2. Product Service (Port 5000)
- **Technology**: Bun + Hono + MongoDB
- **Database**: MongoDB
- **Features**:
  - Product catalog management
  - Stock management
  - Product search and filtering
  - Publishes product events (created, updated, deleted, stock changes)

### 3. Order Service (Port 4000)
- **Technology**: Node.js + Express + MongoDB
- **Database**: MongoDB
- **Features**:
  - Order creation and management
  - Order status tracking
  - Payment status management
  - Publishes order events (created, updated, cancelled, completed)

### 4. RabbitMQ Message Broker
- **Queues**:
  - `auth-events`: User-related events
  - `product-events`: Product-related events
  - `order-events`: Order-related events
  - `notification-events`: Notification events

## Event-Driven Communication

### Event Types

#### User Events
- `user.created`: When a new user registers
- `user.updated`: When user profile is updated
- `user.deleted`: When user account is deleted

#### Product Events
- `product.created`: When a new product is added
- `product.updated`: When product details are updated
- `product.deleted`: When a product is removed
- `product.stock.updated`: When product stock changes

#### Order Events
- `order.created`: When a new order is placed
- `order.updated`: When order status changes
- `order.cancelled`: When an order is cancelled
- `order.completed`: When an order is completed

### Communication Flow Examples

1. **User Registration**:
   ```
   User -> Auth Service -> RabbitMQ -> Product Service
                        -> RabbitMQ -> Order Service
   ```

2. **Product Stock Management**:
   ```
   Order Created -> Order Service -> RabbitMQ -> Product Service (reduce stock)
   Order Cancelled -> Order Service -> RabbitMQ -> Product Service (restore stock)
   ```

3. **Order Processing**:
   ```
   Order -> Order Service -> RabbitMQ -> Product Service (update stock)
                          -> RabbitMQ -> Auth Service (update user stats)
   ```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Bun (for Product Service development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd microservices
```

### 2. Start All Services
```bash
# Start with Docker Compose
docker-compose up --build

# Or start individual services for development
# Terminal 1: RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Terminal 2: Auth Service
cd Authservice
npm install
npm run dev

# Terminal 3: Product Service
cd Productservice
bun install
bun run index.ts

# Terminal 4: Order Service
cd Orderservice
npm install
npm run dev
```

### 3. Test the Services
```bash
# Create a user
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'

# Create a product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99, "description": "Gaming laptop", "category": "Electronics", "stock": 10}'

# Create an order
curl -X POST http://localhost:4000/orders/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "userEmail": "john@example.com", "items": [{"productId": "product-id", "productName": "Laptop", "quantity": 1, "price": 999.99}]}'
```

## Monitoring

### RabbitMQ Management UI
- URL: http://localhost:15672
- Username: admin
- Password: password

### Service Health Checks
- Auth Service: http://localhost:3001/
- Product Service: http://localhost:5000/
- Order Service: http://localhost:4000/

## Development

### Project Structure
```
microservices/
├── Authservice/           # Authentication service
│   ├── controller/        # Request handlers
│   ├── services/          # Business logic
│   ├── Router/            # Route definitions
│   └── lib/               # Database connection
├── Productservice/        # Product management service
│   ├── Controller/        # Request handlers
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   └── Routers/           # Route definitions
├── Orderservice/          # Order management service
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   └── routes/            # Route definitions
├── shared/                # Shared utilities
│   ├── messageQueue.js    # RabbitMQ wrapper
│   └── events.js          # Event definitions
└── docker-compose.yml     # Docker services
```

### Adding New Events

1. **Define Event in shared/events.js**:
```javascript
const EVENTS = {
  // ... existing events
  NEW_EVENT: 'new.event'
};
```

2. **Publish Event in Service**:
```javascript
await messageService.publishNewEvent(eventData);
```

3. **Handle Event in Consumer**:
```javascript
switch (event.type) {
  case EVENTS.NEW_EVENT:
    this.handleNewEvent(event.data);
    break;
}
```

## API Documentation

See [API_Examples.md](./API_Examples.md) for detailed API usage examples.

## Features Demonstrated

✅ **Microservices Architecture**: Separate services with distinct responsibilities  
✅ **Event-Driven Communication**: RabbitMQ for asynchronous messaging  
✅ **Technology Diversity**: Node.js, Bun, different databases  
✅ **Containerization**: Docker containers for all services  
✅ **Service Discovery**: Services communicate via message queues  
✅ **Fault Tolerance**: Message queues provide reliability  
✅ **Scalability**: Services can be scaled independently  
✅ **Monitoring**: RabbitMQ management UI for queue monitoring  

## Common Patterns Implemented

- **Event Sourcing**: Services publish events for state changes
- **CQRS**: Separate read/write operations where appropriate
- **Circuit Breaker**: Error handling for message publishing
- **Dead Letter Queues**: Failed message handling
- **Message Acknowledgment**: Reliable message processing
- **Idempotency**: Safe message reprocessing

## Troubleshooting

### Common Issues

1. **RabbitMQ Connection Failed**:
   - Check if RabbitMQ is running: `docker ps`
   - Verify connection URL in environment variables

2. **Service Not Receiving Events**:
   - Check RabbitMQ management UI for queue status
   - Verify event listeners are properly setup

3. **Database Connection Issues**:
   - Ensure databases are running
   - Check connection strings in environment variables

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service
docker-compose logs -f product-service
docker-compose logs -f order-service
```

## Next Steps

- [ ] Add API Gateway (e.g., Kong, Nginx)
- [ ] Implement Circuit Breaker pattern
- [ ] Add distributed tracing (Jaeger/Zipkin)
- [ ] Implement health checks
- [ ] Add metrics collection (Prometheus)
- [ ] Set up centralized logging (ELK Stack)
- [ ] Add security (API keys, OAuth2)
- [ ] Implement saga pattern for complex transactions

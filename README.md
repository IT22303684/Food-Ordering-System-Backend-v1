# Food Ordering System

A microservices-based food ordering system with real-time order tracking, delivery management, and driver allocation capabilities.

## System Architecture

The system consists of the following microservices, each with specific responsibilities:

### 1. Auth Service

The auth-service manages user registration, authentication, roles, and profiles. It supports various user types including customers, restaurant admins, and delivery personnel. The service implements JWT-based authentication for secure access and provides role-based access control throughout the platform. It handles user management, authentication, and authorization across all services.

### 2. Order Service

The Order Service manages the entire order lifecycle, from creation to fulfillment. It handles order validation, storage, status tracking, and history. When a customer places an order, this service coordinates with other services (Payment and Delivery) to ensure smooth order processing. It provides APIs for retrieving order history and status, supporting both customers and restaurant staff. The microservices approach ensures accurate, efficient order processing and supports future analytics and business requirements.

### 3. Restaurant Service

The Restaurant Service manages restaurant profiles, menus, categories, and associated information. Restaurant administrators use this service to manage availability, add menu items, set prices, and update their offerings. It provides APIs for customers to browse restaurants and menus. By decoupling restaurant management from other concerns, this service enables independent scaling and rapid updates, ensuring efficient restaurant operations.

### 4. Payment Service

The Payment Service handles all payment processing securely. It integrates with third-party payment gateways (PayHere) to manage payment initiation, confirmation, and status updates. By separating financial operations from other business logic, this service enhances security and regulatory compliance. It communicates with the Order Service to confirm payment completion and trigger order fulfillment workflows.

### 5. Delivery Service

The Delivery Service manages delivery assignments and tracking. Once an order is ready, it assigns available delivery personnel, tracks delivery status in real-time, and updates customers and restaurants. The service handles delivery routing, status changes, and notifications. It can be extended to integrate with mapping or real-time tracking APIs for enhanced delivery experiences.

### 6. Cart Service

The Cart Service enables customers to manage their shopping cart before placing an order. It maintains cart state for each user, supports quantity adjustments, and calculates totals. This service ensures fast, isolated cart operations and can be independently scaled to handle peak browsing and ordering times.

### 7. Driver Service

The Driver Service manages delivery personnel profiles, availability, and assignments. Drivers can update their status (online/offline), view assigned deliveries, and update delivery progress. By separating driver management from delivery logistics, this service supports efficient workforce management and can be integrated with HR or payroll systems.

### 8. Notification Service

The Notification Service sends real-time notifications to users, restaurant admins, and delivery personnel via email, SMS, or messaging apps. Designed for high scalability and reliability, it supports both simple and bulk notifications. The service integrates with providers like SendGrid, Twilio, or WhatsApp, ensuring stakeholders are promptly informed about order updates, delivery status, and promotions.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (for Kubernetes deployment)
- MongoDB
- RabbitMQ
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

## Quick Start with Docker Compose

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd food-ordering-system
   ```

2. Create a `.env` file in each service directory with the following variables:

   ```
   MONGODB_URI=mongodb://mongodb:27017/food_ordering
   RABBITMQ_URL=amqp://rabbitmq:5672
   JWT_SECRET=your_jwt_secret
   PAYHERE_MERCHANT_ID=your_merchant_id
   PAYHERE_SECRET=your_payhere_secret
   SENDGRID_API_KEY=your_sendgrid_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   ```

3. Build and start all services:

   ```bash
   docker-compose up --build
   ```

4. Access the services:
   - Order Service: http://localhost:3000
   - Delivery Service: http://localhost:3001
   - Driver Service: http://localhost:3002
   - Notification Service: http://localhost:3003
   - Auth Service: http://localhost:3004
   - Restaurant Service: http://localhost:3005
   - Payment Service: http://localhost:3006
   - Cart Service: http://localhost:3007

## Kubernetes Deployment

1. Create Kubernetes secrets:

   ```bash
   kubectl create secret generic mongodb-secret --from-literal=uri=mongodb://mongodb:27017/food_ordering
   kubectl create secret generic rabbitmq-secret --from-literal=url=amqp://rabbitmq:5672
   kubectl create secret generic jwt-secret --from-literal=secret=your_jwt_secret
   kubectl create secret generic payhere-secret --from-literal=merchant_id=your_merchant_id --from-literal=secret=your_payhere_secret
   kubectl create secret generic sendgrid-secret --from-literal=api_key=your_sendgrid_key
   kubectl create secret generic twilio-secret --from-literal=account_sid=your_twilio_sid --from-literal=auth_token=your_twilio_token
   ```

2. Deploy MongoDB and RabbitMQ:

   ```bash
   kubectl apply -f k8s/mongodb-deployment.yaml
   kubectl apply -f k8s/rabbitmq-deployment.yaml
   ```

3. Deploy all services:

   ```bash
   kubectl apply -f k8s/auth-deployment.yaml
   kubectl apply -f k8s/order-deployment.yaml
   kubectl apply -f k8s/delivery-deployment.yaml
   kubectl apply -f k8s/driver-deployment.yaml
   kubectl apply -f k8s/notification-deployment.yaml
   kubectl apply -f k8s/restaurant-deployment.yaml
   kubectl apply -f k8s/payment-deployment.yaml
   kubectl apply -f k8s/cart-deployment.yaml
   ```

4. Deploy services:
   ```bash
   kubectl apply -f k8s/auth-service.yaml
   kubectl apply -f k8s/order-service.yaml
   kubectl apply -f k8s/delivery-service.yaml
   kubectl apply -f k8s/driver-service.yaml
   kubectl apply -f k8s/notification-service.yaml
   kubectl apply -f k8s/restaurant-service.yaml
   kubectl apply -f k8s/payment-service.yaml
   kubectl apply -f k8s/cart-service.yaml
   ```

## API Documentation

### Auth Service

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify user email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify` - Verify authentication
- `GET /api/auth/users` - Get all users
- `GET /api/auth/users/:id` - Get user by ID
- `PATCH /api/auth/users/:id` - Update user
- `DELETE /api/auth/users/:id` - Delete user
- `PATCH /api/auth/users/:id/status` - Update user status
- `PATCH /api/auth/users/:id/role` - Update user role

### Restaurant Service

- `GET /api/restaurants/:restaurantId/categories` - Get restaurant categories
- `POST /api/restaurants/:restaurantId/categories` - Add new category
- `PATCH /api/restaurants/:restaurantId/categories/:categoryId` - Update category
- `DELETE /api/restaurants/:restaurantId/categories/:categoryId` - Delete category
- `GET /api/restaurants/:restaurantId/menu-items` - Get menu items
- `GET /api/restaurants/:restaurantId/menu-items/:menuItemId` - Get menu item details
- `POST /api/restaurants/:restaurantId/menu-items` - Add menu item
- `PATCH /api/restaurants/:restaurantId/menu-items/:menuItemId` - Update menu item
- `DELETE /api/restaurants/:restaurantId/menu-items/:menuItemId` - Delete menu item
- `GET /api/restaurants/all` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants/register` - Register new restaurant
- `GET /api/restaurants/` - Get authenticated user's restaurant
- `PATCH /api/restaurants/availability` - Update restaurant availability
- `PATCH /api/restaurants/:id` - Update restaurant status
- `PUT /api/restaurants/:id` - Update restaurant information
- `DELETE /api/restaurants/:id` - Delete restaurant

### Order Service

- `POST /api/orders/` - Create new order
- `GET /api/orders/:orderId` - Get order details
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/restaurant/:restaurantId` - Get restaurant orders
- `PATCH /api/orders/:orderId/status` - Update order status
- `PATCH /api/orders/:orderId/payment` - Update payment status
- `POST /api/orders/:orderId/cancel` - Cancel order
- `DELETE /api/orders/:orderId` - Delete order

### Delivery Service

- `POST /api/delivery/assign` - Assign delivery driver
- `PUT /api/delivery/:deliveryId/status` - Update delivery status
- `GET /api/delivery/:deliveryId/status` - Get delivery status
- `GET /api/delivery/:deliveryId/location` - Get driver location
- `GET /api/delivery/order/:orderId` - Get delivery by order ID

### Notification Service

- `POST /api/email/reject-restaurant` - Send restaurant rejection email
- `POST /api/email/approve-restaurant` - Send restaurant approval email
- `POST /api/email/block-restaurant` - Send restaurant blocked email
- `POST /api/email/verify` - Send verification email
- `POST /api/email/reset-password` - Send password reset email
- `POST /api/email/order-confirmation` - Send order confirmation email
- `POST /api/email/order-status` - Send order status update email
- `POST /api/email/payment-confirmation` - Send payment confirmation email
- `POST /api/notification/` - Create notification
- `GET /api/notification/:userId` - Get user notifications
- `PATCH /api/notification/:notificationId/read` - Mark notification as read
- `DELETE /api/notification/:notificationId` - Delete notification

### Payment Service

- `POST /api/payments/process` - Process payment
- `POST /api/payments/notify` - Handle payment notification
- `GET /api/payments/return` - Handle payment return
- `GET /api/payments/cancel` - Handle payment cancellation
- `GET /api/payments/all` - Get all payments
- `POST /api/payments/refund` - Process refund

### Cart Service

- `GET /api/carts/:userId` - Get user cart
- `POST /api/carts/:userId/items` - Add item to cart
- `PATCH /api/carts/:userId/items/:menuItemId` - Update cart item
- `DELETE /api/carts/:userId/items/:menuItemId` - Remove cart item
- `DELETE /api/carts/:userId` - Clear cart

### Driver Service

- `POST /api/drivers/register` - Register new driver
- `GET /api/drivers/me` - Get driver profile
- `PUT /api/drivers/:driverId/location` - Update driver location
- `PUT /api/drivers/:driverId/availability` - Update driver availability
- `GET /api/drivers/available` - Get available drivers
- `GET /api/drivers/:driverId` - Get driver details
- `POST /api/drivers/:driverId/assign` - Assign delivery task
- `POST /api/drivers/:driverId/complete` - Mark delivery as completed

## Development

1. Install dependencies:

   ```bash
   cd <service-directory>
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Build for production:

   ```bash
   npm run build
   ```

## Environment Variables

Each service requires the following environment variables:

### Common Variables

- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `PORT`: Service port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT token generation

### Service-Specific Variables

#### Auth Service

- `JWT_EXPIRES_IN`: JWT token expiration time
- `PASSWORD_RESET_EXPIRES_IN`: Password reset token expiration time

#### Payment Service

- `PAYHERE_MERCHANT_ID`: PayHere merchant ID
- `PAYHERE_SECRET`: PayHere API secret
- `PAYHERE_MODE`: Payment mode (sandbox/production)

#### Notification Service

- `SENDGRID_API_KEY`: SendGrid API key
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `WHATSAPP_BUSINESS_ID`: WhatsApp Business ID

#### Restaurant Service

- `UPLOAD_PATH`: Path for storing uploaded images
- `MAX_FILE_SIZE`: Maximum file size for uploads


## Error Handling

The system uses a standardized error handling approach:

1. HTTP Status Codes:

   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

2. Error Response Format:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": {
    // Additional error details
  }
}
```

## Logging

The system implements structured logging using Winston:

1. Log Levels:

   - error: Error events
   - warn: Warning events
   - info: Informational events
   - debug: Debug information
   - trace: Detailed trace information

2. Log Format:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "service": "order-service",
  "message": "Order created successfully",
  "metadata": {
    // Additional context
  }
}
```

## Monitoring

The system uses Prometheus and Grafana for monitoring:

1. Key Metrics:

   - Request latency
   - Error rates
   - Service health
   - Resource utilization
   - Business metrics (orders, deliveries, etc.)

2. Alerts:
   - Service downtime
   - High error rates
   - Resource exhaustion
   - Business metric thresholds

## Security

1. Authentication:

   - JWT-based authentication
   - Role-based access control
   - Password hashing with bcrypt
   - Rate limiting

2. Data Protection:

   - Input validation
   - Output sanitization
   - Secure headers
   - CORS configuration

3. Payment Security:
   - PCI DSS compliance
   - Secure payment processing
   - Tokenization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Development Guidelines

1. Code Style:

   - Follow ESLint configuration
   - Use Prettier for formatting
   - Write meaningful commit messages

2. Testing:

   - Write unit tests for new features
   - Maintain test coverage above 80%
   - Include integration tests for critical paths

3. Documentation:
   - Update API documentation
   - Add inline code comments
   - Update README for significant changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact:

- Email: support@foodordering.com
- Documentation: https://docs.foodordering.com
- Issue Tracker: https://github.com/your-repo/issues

# Brick Lane - Manufacturing DBMS

A modern, full-featured Database Management System designed for brick manufacturing operations. Built with contemporary web technologies and distributed database architecture.

## Overview

Brick Lane DBMS provides comprehensive management capabilities for brick manufacturing facilities, enabling efficient tracking of workforce, production, sales, logistics, and financial operations through an intuitive web interface.

## Key Features

### Workforce Management
- Complete employee records with departmental organization
- Salary tracking and workforce analytics
- Department-based resource allocation

### Production Tracking
- Real-time production monitoring by brick type
- Quantity tracking and production history
- Multi-product line support

### Sales & Purchasing
- Customer purchase management with automatic cost calculation
- Invoice generation and tracking
- Revenue analytics and reporting

### Supply Chain & Logistics
- Delivery scheduling and tracking
- Vehicle assignment and route management
- Location-based distribution monitoring

### Financial Management
- Comprehensive accounting system
- Credit and debit transaction tracking
- Automated balance calculations
- Financial reporting capabilities

## Technology Stack

### Frontend
- Modern HTML5, CSS3, and JavaScript (ES6+)
- Responsive design with dark theme
- Real-time data updates
- Smooth animations and transitions

### Backend
- Node.js with Express.js framework
- RESTful API architecture
- Asynchronous request handling
- Comprehensive error management

### Database
- TiDB Cloud - MySQL-compatible distributed SQL database
- Horizontal scalability
- ACID compliance
- High availability with automatic failover
- Cloud-native architecture

## Database Schema

The system utilizes a normalized relational database structure:

- **Users** - Authentication and access control
- **Brick Types** - Product catalog with pricing
- **Departments** - Organizational structure
- **Workers** - Employee records with foreign key relationships
- **Production** - Manufacturing output tracking
- **Purchases** - Sales transactions
- **Supplies** - Logistics and delivery management
- **Accounts** - Financial transaction ledger

## Architecture

### API Endpoints

**Authentication**
- `POST /api/auth/login` - User authentication

**Resource Management**
- `GET|POST|PUT|DELETE /api/workers` - Workforce operations
- `GET|POST|DELETE /api/production` - Production tracking
- `GET|POST|DELETE /api/purchases` - Sales management
- `GET|POST|DELETE /api/supplies` - Logistics operations
- `GET|POST|DELETE /api/accounts` - Financial transactions

**Utilities**
- `GET /api/brick-types` - Product catalog
- `GET /api/departments` - Organizational units
- `GET /api/health` - System health check

## Security Features

- Parameterized SQL queries preventing injection attacks
- Environment-based configuration management
- Secure credential storage
- CORS configuration
- SSL/TLS support for database connections

## Performance Optimization

- Connection pooling for database efficiency
- Indexed database queries
- Asynchronous operations
- Optimized frontend rendering
- Cached static resources

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Microsoft Edge

## License

MIT License - See LICENSE file for details

## Developer

Kishore Prashanth

---

**A professional database management solution for modern brick manufacturing operations.**

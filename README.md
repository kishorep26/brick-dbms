# Brick Lane - Manufacturing DBMS

A modern, full-featured Database Management System for brick manufacturing industries. Built with modern web technologies and **TiDB** distributed database.

![Brick Lane DBMS](brick.jpg)

## 🌟 Features

- **Worker Management**: Add, edit, delete, and search worker records
- **Production Tracking**: Record and monitor brick production by type and date
- **Purchase Management**: Track customer purchases with automatic cost calculation
- **Supply Chain**: Manage delivery logistics with vehicle and location tracking
- **Accounting**: Maintain financial records with automatic balance calculation
- **Modern UI**: Dark theme with smooth animations and responsive design
- **Real Database**: TiDB Cloud - MySQL-compatible distributed SQL database
- **RESTful API**: Complete backend with Express.js

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- TiDB Cloud account (free tier available at https://tidbcloud.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd brick-dbms
   npm install
   ```

2. **Set up TiDB Cloud**
   - Create a free account at https://tidbcloud.com
   - Create a new cluster (Developer Tier is free)
   - Get your connection credentials

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your TiDB credentials
   ```

4. **Create database schema**
   - Use TiDB Cloud SQL Editor
   - Run the SQL from `database/schema.sql`

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the app**
   - Open http://localhost:3000
   - Login: `kishore` / `123` or `admin` / `admin123`

## 📦 Project Structure

```
brick-dbms/
├── index.html          # Frontend UI
├── styles.css          # Styling
├── app.js             # Frontend logic
├── server.js          # Backend API
├── database/
│   └── schema.sql     # Database schema
├── package.json       # Dependencies
├── .env.example       # Environment template
└── README.md          # This file
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SSL`
5. Deploy!

### Deploy to Railway

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Deploy automatically

### Deploy to Render

1. Go to https://render.com
2. Create new Web Service
3. Connect repository
4. Build: `npm install`
5. Start: `npm start`
6. Add environment variables
7. Deploy

## 💾 Database

### TiDB Cloud Features
- MySQL-compatible distributed SQL
- Free tier available (no credit card required)
- Automatic backups
- High availability
- Horizontal scalability

### Database Schema
- `users` - Authentication
- `brick` - Brick types and pricing
- `department` - Department information
- `worker` - Worker records
- `production` - Production tracking
- `purchase` - Customer purchases
- `supplies` - Delivery logistics
- `account` - Financial transactions

## 🔒 Security

For production deployment:
- Implement password hashing (bcrypt/argon2)
- Use JWT tokens for authentication
- Enable HTTPS/TLS
- Configure CORS for specific origins
- Add rate limiting
- Validate all inputs

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: TiDB Cloud (MySQL-compatible)
- **Styling**: Modern CSS with animations
- **API**: RESTful architecture

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Add worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker

### Production
- `GET /api/production` - Get production records
- `POST /api/production` - Add production
- `DELETE /api/production/:date/:brickId` - Delete production

### Purchases
- `GET /api/purchases` - Get purchases
- `POST /api/purchases` - Add purchase
- `DELETE /api/purchases/:invoice` - Delete purchase

### Supplies
- `GET /api/supplies` - Get supplies
- `POST /api/supplies` - Add supply
- `DELETE /api/supplies/:invoice` - Delete supply

### Accounts
- `GET /api/accounts` - Get transactions
- `POST /api/accounts` - Add transaction
- `DELETE /api/accounts/:sno` - Delete transaction

### Utility
- `GET /api/brick-types` - Get brick types
- `GET /api/departments` - Get departments
- `GET /api/health` - Health check

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Developer

Created by Kishore Prashanth

---

**A modern DBMS project with real distributed database technology** 🚀

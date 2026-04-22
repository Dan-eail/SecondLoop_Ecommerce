# ተና SecondLoop Ecommerce 🇪🇹

> **Ethiopia's Trusted C2C Marketplace for Used Goods**
> Secure escrow payments · Phone verification · Real-time messaging · Admin dashboard

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Folder Structure](#folder-structure)
- [Seeding Data](#seeding-data)
- [Docker Deployment](#docker-deployment)
- [Default Credentials](#default-credentials)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Phone Auth | OTP-based registration with Ethiopian phone numbers (+251XXXXXXXXX) |
| 🔒 Escrow Payments | 5-step escrow workflow with Telebirr integration |
| 💬 Real-time Chat | Socket.io messaging with typing indicators and read receipts |
| 📦 Product Listings | Full CRUD with multi-image upload (Cloudinary/WebP) |
| 🔍 Advanced Search | Full-text search with filters (price, category, condition, city) |
| ⭐ Reviews | Post-transaction ratings with seller response |
| 🛡️ Admin Dashboard | User management, product moderation, escrow release, analytics |
| 📱 Mobile-First | Responsive design with Ethiopian colour palette |
| 🌐 Bilingual | English & Amharic (አማርኛ) language support |
| ⏱️ Cron Jobs | Auto-expire listings, auto-release escrow after 48h |

---

## 🛠 Tech Stack

**Backend**
- Node.js 18 + Express 4
- MongoDB 6 + Mongoose 7
- Socket.io 4 (real-time messaging)
- JWT (access + refresh tokens)
- Cloudinary (image storage, auto WebP)
- Multer (file uploads)
- node-cron (background jobs)
- Helmet + express-rate-limit (security)

**Frontend**
- React 18 + Vite
- React Router DOM v6
- Tailwind CSS 3
- React Query (server state)
- React Hook Form
- Framer Motion (animations)
- Socket.io Client
- React Hot Toast

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A MongoDB database (recommended: MongoDB Atlas URI)
- Cloudinary account (free tier works)

### 1. Clone / extract the project
```bash
cd SecondLoop_Ecommerce
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env
nano .env   # or use your editor

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit VITE_API_URL if needed (default: http://localhost:5000/api/v1)

# Start development server
npm run dev
```

### 4. Access the app
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/v1
- **Health check:** http://localhost:5000/health

---

## 🌱 Seeding Data

Populate the database with sample users and products:

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin user
- 4 Seller/User accounts
- 8 sample product listings across categories

---

## 🔑 Default Credentials (after seeding)

| Role | Phone | Password |
|---|---|---|
| Admin | +251911111111 | Admin@1234 |
| Seller | +251922222222 | Seller@1234 |
| Seller | +251933333333 | Seller@1234 |
| User | +251944444444 | User@12345 |

---

## ⚙️ Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/tena_marketplace?retryWrites=true&w=majority

# JWT Secrets (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMS (Ethio Telecom / AfricasTalking)
SMS_API_KEY=your_sms_api_key

# Admin contact
ADMIN_PHONE=+251911111111

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services (MongoDB + Backend + Frontend)
docker-compose up --build -d

# View logs
docker-compose logs -f backend

# Seed data in Docker
docker-compose exec backend npm run seed

# Stop
docker-compose down
```

> Note: Docker is optional. If you don't have Docker installed, you can run everything with Node.js and a MongoDB Atlas connection string (see Quick Start + seeding above).

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register with phone |
| POST | `/api/v1/auth/verify-otp` | Verify OTP |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh-token` | Refresh JWT |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/forgot-password` | Request OTP |
| POST | `/api/v1/auth/reset-password` | Reset password |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | List with filters |
| POST | `/api/v1/products` | Create listing |
| GET | `/api/v1/products/:id` | Get product |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |
| POST | `/api/v1/products/:id/wishlist` | Toggle wishlist |
| GET | `/api/v1/users/:userId/products` | User's products |

### Orders & Escrow
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders` | Get user orders |
| GET | `/api/v1/orders/:id` | Order details |
| POST | `/api/v1/orders/:id/payment-proof` | Upload payment screenshot |
| POST | `/api/v1/orders/:id/confirm-delivery` | Confirm receipt |
| POST | `/api/v1/orders/:id/dispute` | File dispute |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/messages/conversations` | List conversations |
| POST | `/api/v1/messages/conversations` | Start conversation |
| GET | `/api/v1/messages/conversations/:id` | Get messages |
| POST | `/api/v1/messages/conversations/:id` | Send message |

### Admin (requires admin role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/users` | All users |
| PUT | `/api/v1/admin/users/:id` | Update user status |
| GET | `/api/v1/admin/products` | Products for moderation |
| PUT | `/api/v1/admin/products/:id` | Moderate product |
| POST | `/api/v1/admin/orders/:id/release-payment` | Release escrow |
| POST | `/api/v1/admin/orders/:id/resolve-dispute` | Resolve dispute |
| GET | `/api/v1/admin/analytics` | Platform analytics |

---

## 📁 Folder Structure

```
SecondLoop_Ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, Cloudinary, constants
│   │   ├── controllers/   # auth, product, order, admin, message, review, user
│   │   ├── middleware/    # auth, error, security, upload, rateLimit
│   │   ├── models/        # User, Product, Order, Review, Message, etc.
│   │   ├── routes/        # All route files
│   │   ├── services/      # sms, email
│   │   ├── sockets/       # Socket.io setup
│   │   ├── jobs/          # Cron jobs
│   │   ├── seeders/       # Seed data
│   │   ├── utils/         # Helpers, logger, token generators
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/    # Header, Footer, PrivateRoute, LoadingSpinner, etc.
│   │   │   ├── layout/    # MainLayout, DashboardLayout, AdminLayout
│   │   │   ├── product/   # ProductCard, ProductGrid
│   │   │   └── ui/
│   │   ├── contexts/      # AuthContext, CartContext, SocketContext
│   │   ├── hooks/         # useAuth, useCart, useSocket
│   │   ├── pages/         # All 20+ pages
│   │   ├── services/      # api, authService, productService, etc.
│   │   ├── utils/         # formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── Dockerfile
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join_conversation` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send a message |
| `new_message` | Server → Client | Receive a message |
| `typing` | Client → Server | Typing indicator |
| `user_typing` | Server → Client | Show typing indicator |
| `mark_read` | Client → Server | Mark messages as read |
| `messages_read` | Server → Client | Update read receipts |
| `notification` | Server → Client | Push notification |

---

## 🎨 Design System

**Colours**
- Primary Orange: `#F57C00`
- Primary Green: `#388E3C`
- Primary Brown: `#5D4037`
- Ethiopian Green: `#078930`
- Ethiopian Yellow: `#FCD116`
- Ethiopian Red: `#DA121A`

**Fonts**
- English: Inter
- Amharic: Noto Sans Ethiopic

---

## 📄 License

MIT License — Free to use and modify for commercial and personal projects.

---

Built with ❤️ for Ethiopia 🇪🇹 | ተና SecondLoop

# 🌾 Kayapa Farm-to-Market System

A web-based platform connecting farmers directly with buyers in Kayapa, Nueva Vizcaya. Built with **React + Vite** (frontend) and **Express.js** (backend).

---

## 📁 Project Structure

```
farm-to-market/
├── dashboard/                  # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Transactions.css
│   │   │   ├── Transactions.jsx     ← Transactions page
│   │   │   ├── Home.css
│   │   │   ├── Home.jsx        ← Login / Register page
│   │   │   ├── Orders.css
│   │   │   ├── Orders.jsx           ← Orders & Reports page
│   │   │   ├── Sidebar.css
│   │   │   ├── Sidebar.jsx     ← Navigation sidebar
│   │   │   ├── Products.css
│   │   │   ├── Products.jsx         ← Products page
│   │   │   ├── Users.css
│   │   │   └── Users.jsx            ← Users management & Profile
│   │   ├── App.css
│   │   ├── App.jsx             ← Routes + Auth context
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Express.js backend
    ├── data.json               ← Users data
    ├── products.json           ← Products data
    ├── orders.json       ← Orders / Transactions data
    ├── index.js                ← API server
    └── package.json
```

---

## 🚀 Setup & Installation

### 1. Install server dependencies
```bash
cd server
npm install
```

### 2. Install dashboard dependencies
```bash
cd dashboard
npm install
```

---

## ▶️ Running the App

### Start the backend server (Terminal 1)
```bash
cd server
node index.js
# Server runs on http://localhost:5000
```

### Start the frontend (Terminal 2)
```bash
cd dashboard
npm run dev
# App runs on http://localhost:5173
```

Open your browser at **http://localhost:5173**

---

## 🔑 Demo Accounts

| Role   | Email              | Password |
|--------|--------------------|----------|
| Farmer | farmer@demo.com    | demo     |
| Farmer | farmer2@demo.com   | demo     |
| Buyer  | buyer@demo.com     | demo     |
| Buyer  | buyer2@demo.com    | demo     |

---

## 🌐 API Endpoints

| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/login                    | User login               |
| POST   | /api/register                 | User registration        |
| GET    | /api/users                    | Get all users            |
| PUT    | /api/users/:id                | Update user profile      |
| PATCH  | /api/users/:id/status         | Toggle user status       |
| GET    | /api/products                 | Get all products         |
| POST   | /api/products                 | Add new product          |
| PUT    | /api/products/:id             | Update product           |
| DELETE | /api/products/:id             | Remove product           |
| GET    | /api/orders                   | Get all orders           |
| POST   | /api/orders                   | Place an order           |
| PATCH  | /api/orders/:id/status        | Update order status      |
| GET    | /api/reports                  | Get report data          |

---

## 👥 User Roles & Features

### 👨‍🌾 Farmer
- View dashboard with listing & order stats
- Add, edit price, and remove product listings
- Accept or decline incoming orders
- Mark accepted orders as completed
- View transaction history
- Edit profile

### 🛒 Buyer
- Browse and search available products
- Filter by category
- Place orders directly with farmers
- Track order status
- View transaction history
- Edit profile

### 🛡️ Admin
- View platform-wide dashboard
- Manage all registered users (activate/deactivate)
- Monitor all transactions
- View reports: top products, top farmers, revenue
- Edit profile

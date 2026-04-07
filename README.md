# 🤖 Thambi — Autonomous Robot Food Delivery Platform

> A full-stack restaurant management system where robots autonomously deliver food to tables. Customers browse the menu on their phone via a QR code, place orders, and a robot navigates to their table and delivers the food — no human serving required.

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Thambi Monorepo                      │
│                                                          │
│  ┌────────────────┐   ┌────────────────┐                 │
│  │ thambi_customer│   │  thambi_admin  │                 │
│  │  Vite + React  │   │  Vite + React  │                 │
│  │  Port: 5173    │   │  Port: 5174    │                 │
│  └───────┬────────┘   └───────┬────────┘                 │
│          │ REST + Socket.IO   │ REST + Socket.IO          │
│          └─────────┬──────────┘                          │
│                    ▼                                      │
│          ┌──────────────────┐                            │
│          │ thambi_backend   │                            │
│          │  NestJS + Mongo  │                            │
│          │  Port: 3000      │                            │
│          └──────────────────┘                            │
└──────────────────────────────────────────────────────────┘
```

### Services at a glance

| Service | Stack | Port | Role |
|---|---|---|---|
| `thambi_backend` | NestJS · Mongoose · Socket.IO · JWT | 3000 | REST API + real-time event bus |
| `thambi_customer` | Vite · React · TypeScript | 5173 | Customer-facing QR menu |
| `thambi_admin` | Vite · React · TypeScript | 5174 | Owner / Staff dashboard |

---

## ✨ Features

### Customer App (`thambi_customer`)
- 📱 **QR Code access** — customers scan a table QR to open the menu, no login needed
- 🌟 **Immersive menu** — hero banner with ambient glow, category pills, grouped item sections
- 🛒 **Cart & checkout** — floating cart pill → bottom-sheet order summary → payment selection (Card / UPI / Cash)
- 📦 **Live order tracking** — real-time status timeline (Confirmed → Preparing → Delivering → Delivered) via Socket.IO

### Admin Dashboard (`thambi_admin`)
- 🔐 **Role-based login** — Owner and Staff roles with JWT auth
- 📊 **Live dashboard** — real-time KPIs: orders today, revenue, active deliveries, robots online
- 🍽️ **Order management** — view and update order statuses with filter tabs
- 🤖 **Robot Fleet** — see all robots, battery level, cabinet occupancy, and current mode
- 🚀 **Delivery management** — create and monitor deliveries per robot
- 💳 **Payments** — browse payment history with date + status filters

### Backend (`thambi_backend`)
- RESTful API with JWT + role guards
- MongoDB with Mongoose schemas
- Socket.IO gateway for real-time events (`order:new`, `order:updated`, `delivery:updated`)
- Robot telemetry ingestion endpoint
- Database seed script

---

## 🛠️ Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| MongoDB | Community Server 6+ (local) |

> **MongoDB must be running locally** before starting the backend.  
> Install from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)  
> On Windows, start it with: `net start MongoDB`

---

## 🚀 Setup & Running

### 1. Clone the repo

```bash
git clone https://github.com/NikhilY492/Thambi.git
cd Thambi
```

### 2. Backend

```bash
cd thambi_backend
npm install
```

Create the environment file:

```bash
# thambi_backend/.env
MONGODB_URI=mongodb://localhost:27017/thambi
JWT_SECRET=thambi-super-secret-key-change-in-prod
PORT=3000
```

Seed the database (creates a restaurant, tables, menu items, robots, and user accounts):

```bash
npm run seed
```

> The seed script prints the `restaurant_id` and `table_id` — **save these**, you'll need them for the customer URL.

Start the backend in development watch mode:

```bash
npm run start:dev
```

The API is now running at **http://localhost:3000**

---

### 3. Admin Dashboard

```bash
cd ../thambi_admin
npm install
npm run dev
```

Open **http://localhost:5174**

**Seeded credentials:**

| Role | User ID | Password |
|---|---|---|
| Owner | `owner01` | `password123` |
| Staff | `staff01` | `password123` |

---

### 4. Customer App

```bash
cd ../thambi_customer
npm install
npm run dev
```

Open the customer menu using the IDs printed by the seed script:

```
http://localhost:5173/?r=<restaurant_id>&t=<table_id>
```

Example:
```
http://localhost:5173/?r=69a6e1d86b10ed9cd787524d&t=69a6e1d86b10ed9cd787524e
```

> In production, this URL is encoded into a QR code placed on each table.

---

## 📂 Project Structure

```
Thambi/
├── thambi_backend/          # NestJS REST API + WebSocket gateway
│   ├── src/
│   │   ├── auth/            # JWT auth, guards, decorators
│   │   ├── orders/          # Order CRUD + status updates
│   │   ├── robots/          # Robot registry
│   │   ├── deliveries/      # Delivery routing
│   │   ├── payments/        # Payment records
│   │   ├── events/          # Socket.IO gateway
│   │   ├── robot-runtime/   # Live robot telemetry
│   │   └── seed.ts          # Database seeder
│   └── .env                 # Environment variables
│
├── thambi_admin/            # Owner / Staff React dashboard
│   └── src/
│       ├── pages/           # Dashboard, Orders, Robots, Deliveries, Payments
│       ├── components/      # Sidebar, AppLayout, RobotCard, Toast ...
│       ├── context/         # AuthContext (JWT + user info)
│       ├── hooks/           # useSocket (real-time)
│       └── api/             # Axios API clients
│
└── thambi_customer/         # Customer-facing React menu app
    └── src/
        ├── pages/           # MenuPage, CheckoutPage, OrderTrackerPage
        ├── components/      # ItemCard, CartDrawer (bottom sheet), StatusTimeline
        ├── hooks/           # useCart, useSocket
        └── api/             # menu.ts, orders.ts
```

---

## 🔌 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Login, returns JWT |
| `GET` | `/auth/me` | JWT | Current user info |
| `GET` | `/restaurants/:id` | — | Restaurant details |
| `GET` | `/categories?restaurant_id=` | — | Menu categories |
| `GET` | `/menu?restaurant_id=&category_id=` | — | Menu items |
| `POST` | `/orders` | — | Place a new order |
| `GET` | `/orders/:id` | — | Get order by ID |
| `PATCH` | `/orders/:id/status` | JWT | Update order status |
| `GET` | `/robots?restaurant_id=` | JWT | List robots |
| `GET` | `/deliveries/active?restaurant_id=` | JWT | Active deliveries |
| `GET` | `/payments/summary?restaurant_id=` | JWT | Payment summary / KPIs |

### Socket.IO Events (real-time)

| Event | Direction | Payload |
|---|---|---|
| `order:new:<restaurantId>` | Server → Client | New order object |
| `order:updated:<restaurantId>` | Server → Client | Updated order object |
| `delivery:updated:<restaurantId>` | Server → Client | Delivery status change |

---

## 🌱 Seed Accounts

The `npm run seed` command creates the following users:

| Name | User ID | Password | Role |
|---|---|---|---|
| Restaurant Owner | `owner01` | `password123` | Owner |
| Staff Member | `staff01` | `password123` | Staff |

---

## 🧩 Environment Variables

`thambi_backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/thambi
JWT_SECRET=thambi-super-secret-key-change-in-prod
PORT=3000
```

`thambi_customer/.env` (optional — defaults to `http://localhost:3000`):

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## 📜 License

MIT

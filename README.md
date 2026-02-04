# CraveCraft Hackathon Stack

Restaurant-as-retail commerce with microservices, JWT RBAC, and a React SPA.

## Architecture
- Gateway (API routing + JWT/RBAC)
- Auth, Menu, Orders, Inventory, Group Orders, Notifications microservices
- MongoDB (local)

## Quick Start (Windows PowerShell)
1. Start MongoDB locally
2. Install backend deps
```
cd e:\Hackathon\backend
npm install
npm --prefix gateway install
npm --prefix services/auth install
npm --prefix services/menu install
npm --prefix services/orders install
npm --prefix services/inventory install
npm --prefix services/group-orders install
npm --prefix services/notifications install
```
3. Seed data
```
npm run seed
```
4. Run all services
```
npm run dev
```
5. Frontend
```
cd e:\Hackathon\frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and hits gateway at `http://localhost:4000`.

## Roles
- Register as `user` or `admin` from the UI.
- Admin sees Inventory and Order controls.

## Notable Features
- Custom bowl builder with dynamic pricing
- Combo orders and group ordering
- Live order tracking with ETA and quick reorder
- Inventory auto-disables ingredients and menu items
- Discount streaks (5+ orders)

## Environment
Copy `backend/.env.example` to `backend/.env` if you want to override defaults.

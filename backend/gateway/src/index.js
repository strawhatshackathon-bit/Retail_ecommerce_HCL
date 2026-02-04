import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  menu: process.env.MENU_SERVICE_URL || "http://localhost:4002",
  orders: process.env.ORDERS_SERVICE_URL || "http://localhost:4003",
  inventory: process.env.INVENTORY_SERVICE_URL || "http://localhost:4004",
  groupOrders: process.env.GROUP_ORDERS_SERVICE_URL || "http://localhost:4005",
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || "http://localhost:4006",
};

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};

const attachUserHeaders = (req, _res, next) => {
  if (req.user) {
    req.headers["x-user-id"] = req.user.id;
    req.headers["x-user-role"] = req.user.role;
    req.headers["x-user-name"] = req.user.name || "";
  }
  next();
};

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(
  "/auth",
  createProxyMiddleware({
    target: SERVICES.auth,
    changeOrigin: true,
    pathRewrite: { "^/auth": "/auth" },
  })
);

app.use(
  "/menu",
  attachUserHeaders,
  createProxyMiddleware({
    target: SERVICES.menu,
    changeOrigin: true,
    pathRewrite: { "^/menu": "/menu" },
  })
);

app.use(
  "/orders",
  requireAuth,
  attachUserHeaders,
  createProxyMiddleware({
    target: SERVICES.orders,
    changeOrigin: true,
    pathRewrite: { "^/orders": "/orders" },
  })
);

app.use(
  "/group-orders",
  requireAuth,
  attachUserHeaders,
  createProxyMiddleware({
    target: SERVICES.groupOrders,
    changeOrigin: true,
    pathRewrite: { "^/group-orders": "/group-orders" },
  })
);

app.use(
  "/inventory",
  requireAuth,
  requireRole("admin"),
  attachUserHeaders,
  createProxyMiddleware({
    target: SERVICES.inventory,
    changeOrigin: true,
    pathRewrite: { "^/inventory": "/inventory" },
  })
);

app.use(
  "/notifications",
  requireAuth,
  requireRole("admin"),
  attachUserHeaders,
  createProxyMiddleware({
    target: SERVICES.notifications,
    changeOrigin: true,
    pathRewrite: { "^/notifications": "/notifications" },
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Gateway running on ${PORT}`);
});

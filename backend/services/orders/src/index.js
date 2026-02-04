import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/hackathon";
await mongoose.connect(dbUrl);

const orderSchema = new mongoose.Schema(
  {
    userId: String,
    items: Array,
    combos: Array,
    customItems: Array,
    total: Number,
    discount: Number,
    status: {
      type: String,
      enum: ["placed", "prepping", "cooking", "out_for_delivery", "delivered"],
      default: "placed",
    },
    etaMinutes: Number,
    groupOrderId: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

const calcEta = (count) => 15 + Math.min(30, count * 3);

const getDiscount = (streak) => {
  if (streak >= 10) return 0.15;
  if (streak >= 5) return 0.1;
  return 0;
};

app.post("/orders", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { items = [], combos = [], customItems = [], total = 0, streak = 0 } = req.body || {};
  if (!userId) return res.status(401).json({ error: "Missing user" });

  const discountRate = getDiscount(streak);
  const discount = total * discountRate;
  const finalTotal = Math.max(0, total - discount);

  const count = items.length + combos.length + customItems.length;
  const order = await Order.create({
    userId,
    items,
    combos,
    customItems,
    total: finalTotal,
    discount,
    etaMinutes: calcEta(count),
  });

  res.status(201).json(order);
});

app.get("/orders", async (req, res) => {
  const role = req.headers["x-user-role"];
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.get("/orders/my", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  res.json(orders);
});

app.get("/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

app.post("/orders/:id/reorder", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.userId !== userId) return res.status(403).json({ error: "Forbidden" });

  const cloned = await Order.create({
    userId,
    items: order.items,
    combos: order.combos,
    customItems: order.customItems,
    total: order.total,
    discount: order.discount,
    status: "placed",
    etaMinutes: calcEta(order.items.length + order.combos.length + order.customItems.length),
  });
  res.status(201).json(cloned);
});

app.patch("/orders/:id/status", async (req, res) => {
  const role = req.headers["x-user-role"];
  if (role !== "admin") return res.status(403).json({ error: "Admin only" });
  const { status } = req.body || {};
  const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

app.get("/orders/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => console.log(`Orders service on ${PORT}`));

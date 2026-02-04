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

const stockSchema = new mongoose.Schema(
  {
    ingredientId: String,
    name: String,
    stock: Number,
    unit: { type: String, default: "units" },
    threshold: { type: Number, default: 5 },
    isAvailable: { type: Boolean, default: true },
    supplier: {
      name: String,
      phone: String,
      email: String,
      lastRestockAt: Date,
    },
  },
  { timestamps: true }
);

const Stock = mongoose.model("Stock", stockSchema);

const MENU_URL = process.env.MENU_SERVICE_URL || "http://localhost:4002";

app.get("/inventory/ingredients", async (_req, res) => {
  const items = await Stock.find();
  res.json(items);
});

app.post("/inventory/ingredients", async (req, res) => {
  const { ingredientId, name, stock, unit, threshold, supplier } = req.body || {};
  const item = await Stock.create({ ingredientId, name, stock, unit, threshold, supplier });
  res.status(201).json(item);
});

app.patch("/inventory/ingredients/:id", async (req, res) => {
  const { stock, threshold, isAvailable, supplier } = req.body || {};
  const item = await Stock.findByIdAndUpdate(
    req.params.id,
    { $set: { stock, threshold, isAvailable, supplier } },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Not found" });

  if (isAvailable === false && item.ingredientId) {
    await fetch(`${MENU_URL}/menu/ingredients/${item.ingredientId}/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ isAvailable: false }),
    });
  }

  res.json(item);
});

app.post("/inventory/reserve", async (req, res) => {
  const { ingredientId, qty } = req.body || {};
  const item = await Stock.findOne({ ingredientId });
  if (!item) return res.status(404).json({ error: "Not found" });
  if (item.stock < qty) return res.status(409).json({ error: "Insufficient stock" });
  item.stock -= qty;
  if (item.stock <= item.threshold) item.isAvailable = false;
  await item.save();
  res.json(item);
});

app.get("/inventory/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => console.log(`Inventory service on ${PORT}`));

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

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
});

const menuItemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    category: String,
    basePrice: Number,
    imageUrl: String,
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      sodium: Number,
    },
    allergens: [String],
    ingredients: [
      {
        ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
        name: String,
        price: Number,
        required: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const comboSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
      },
    ],
    price: Number,
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
const MenuItem = mongoose.model("MenuItem", menuItemSchema);
const Combo = mongoose.model("Combo", comboSchema);

const requireAdmin = (req, res, next) => {
  if (req.headers["x-user-role"] !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  return next();
};

app.get("/menu/ingredients", async (_req, res) => {
  const data = await Ingredient.find();
  res.json(data);
});

app.post("/menu/ingredients", requireAdmin, async (req, res) => {
  const { name, price } = req.body || {};
  if (!name || price == null) return res.status(400).json({ error: "Invalid" });
  const item = await Ingredient.create({ name, price });
  res.status(201).json(item);
});

app.patch("/menu/ingredients/:id/availability", requireAdmin, async (req, res) => {
  const { isAvailable } = req.body || {};
  const ingredient = await Ingredient.findByIdAndUpdate(
    req.params.id,
    { $set: { isAvailable: !!isAvailable } },
    { new: true }
  );
  if (!ingredient) return res.status(404).json({ error: "Not found" });
  if (!ingredient.isAvailable) {
    await MenuItem.updateMany(
      { "ingredients.ingredientId": ingredient._id },
      { $set: { isActive: false } }
    );
  }
  res.json(ingredient);
});

app.get("/menu/items", async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const filter = includeInactive ? {} : { isActive: true };
  const items = await MenuItem.find(filter);
  res.json(items);
});

app.get("/menu/items/:id", async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

app.post("/menu/items", requireAdmin, async (req, res) => {
  const { name, description, category, basePrice, ingredients, imageUrl } = req.body || {};
  const item = await MenuItem.create({
    name,
    description,
    category,
    basePrice,
    ingredients,
    imageUrl,
  });
  res.status(201).json(item);
});

app.patch("/menu/items/:id", requireAdmin, async (req, res) => {
  const update = req.body || {};
  const item = await MenuItem.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

app.delete("/menu/items/:id", requireAdmin, async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.patch("/menu/items/:id/toggle", requireAdmin, async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.isActive = !item.isActive;
  await item.save();
  res.json(item);
});

app.get("/menu/combos", async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const filter = includeInactive ? {} : { isActive: true };
  const combos = await Combo.find(filter);
  res.json(combos);
});

app.post("/menu/combos", requireAdmin, async (req, res) => {
  const combo = await Combo.create(req.body || {});
  res.status(201).json(combo);
});

app.get("/menu/chef-specials", async (_req, res) => {
  const items = await MenuItem.find({ isActive: true }).limit(6);
  res.json(items);
});

app.post("/menu/customize/price", async (req, res) => {
  const { basePrice, additions } = req.body || {};
  const addPrice = (additions || []).reduce((sum, a) => sum + (a.price || 0) * (a.qty || 1), 0);
  const price = (basePrice || 0) + addPrice;
  res.json({ price });
});

app.get("/menu/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Menu service on ${PORT}`));

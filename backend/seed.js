import mongoose from "mongoose";

const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/hackathon";
await mongoose.connect(dbUrl);

const ingredientSchema = new mongoose.Schema({
  name: String,
  price: Number,
  isAvailable: Boolean,
});

const menuItemSchema = new mongoose.Schema({
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
  ingredients: Array,
  isActive: Boolean,
});

const comboSchema = new mongoose.Schema({
  name: String,
  description: String,
  items: Array,
  price: Number,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  isActive: Boolean,
});

const stockSchema = new mongoose.Schema({
  ingredientId: String,
  name: String,
  stock: Number,
  unit: String,
  threshold: Number,
  isAvailable: Boolean,
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
const MenuItem = mongoose.model("MenuItem", menuItemSchema);
const Combo = mongoose.model("Combo", comboSchema);
const Stock = mongoose.model("Stock", stockSchema);

await Ingredient.deleteMany({});
await MenuItem.deleteMany({});
await Combo.deleteMany({});
await Stock.deleteMany({});

const ingredients = await Ingredient.insertMany([
  { name: "Smoky Chicken", price: 70, isAvailable: true },
  { name: "Paneer Tikka", price: 60, isAvailable: true },
  { name: "Avocado", price: 45, isAvailable: true },
  { name: "Crispy Onions", price: 20, isAvailable: true },
  { name: "Chili Mayo", price: 15, isAvailable: true },
  { name: "Jasmine Rice", price: 25, isAvailable: true },
  { name: "Roasted Veggies", price: 30, isAvailable: true },
]);

const map = Object.fromEntries(ingredients.map((i) => [i.name, i]));

const items = await MenuItem.insertMany([
  {
    name: "Firegrain Chicken Bowl",
    description: "Grilled chicken, jasmine rice, chili mayo, crunchy onion.",
    category: "Bowls",
    basePrice: 220,
    nutrition: { calories: 540, protein: 36, carbs: 58, fat: 18, fiber: 6, sodium: 780 },
    allergens: ["dairy", "gluten"],
    ingredients: [
      { ingredientId: map["Smoky Chicken"]._id, name: "Smoky Chicken", price: 70, required: true },
      { ingredientId: map["Jasmine Rice"]._id, name: "Jasmine Rice", price: 25, required: true },
      { ingredientId: map["Chili Mayo"]._id, name: "Chili Mayo", price: 15, required: false },
    ],
    isActive: true,
  },
  {
    name: "Garden Veg Stack",
    description: "Roasted veggies, avocado crema, citrus crunch.",
    category: "Bowls",
    basePrice: 200,
    nutrition: { calories: 460, protein: 14, carbs: 62, fat: 16, fiber: 8, sodium: 520 },
    allergens: ["nuts"],
    ingredients: [
      { ingredientId: map["Roasted Veggies"]._id, name: "Roasted Veggies", price: 30, required: true },
      { ingredientId: map["Avocado"]._id, name: "Avocado", price: 45, required: false },
    ],
    isActive: true,
  },
]);

await Combo.insertMany([
  {
    name: "Duo Delight",
    description: "Two bowls + shared sides.",
    items: items.map((i) => ({ itemId: i._id, name: i.name })),
    price: 390,
    nutrition: { calories: 980, protein: 50, carbs: 110, fat: 32 },
    isActive: true,
  },
]);

await Stock.insertMany(
  ingredients.map((i) => ({
    ingredientId: i._id.toString(),
    name: i.name,
    stock: 20,
    unit: "units",
    threshold: 5,
    isAvailable: true,
  }))
);

console.log("Seed complete.");
await mongoose.disconnect();

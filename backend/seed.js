import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  orderCount: Number,
  lastOrderAt: Date,
  streak: Number,
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
const MenuItem = mongoose.model("MenuItem", menuItemSchema);
const Combo = mongoose.model("Combo", comboSchema);
const Stock = mongoose.model("Stock", stockSchema);
const User = mongoose.model("User", userSchema);

await Ingredient.deleteMany({});
await MenuItem.deleteMany({});
await Combo.deleteMany({});
await Stock.deleteMany({});
await User.deleteMany({});

const ingredients = await Ingredient.insertMany([
  { name: "Smoky Chicken", price: 70, isAvailable: true },
  { name: "Paneer Tikka", price: 60, isAvailable: true },
  { name: "Avocado", price: 45, isAvailable: true },
  { name: "Crispy Onions", price: 20, isAvailable: true },
  { name: "Chili Mayo", price: 15, isAvailable: true },
  { name: "Jasmine Rice", price: 25, isAvailable: true },
  { name: "Roasted Veggies", price: 30, isAvailable: true },
  { name: "Corn Salsa", price: 18, isAvailable: true },
  { name: "Herb Paneer", price: 65, isAvailable: true },
  { name: "Peri Sauce", price: 12, isAvailable: true },
  { name: "Garlic Aioli", price: 16, isAvailable: true },
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
  {
    name: "Paneer Tikka Bowl",
    description: "Charred paneer, jasmine rice, peri sauce, crisp onions.",
    category: "Bowls",
    basePrice: 210,
    nutrition: { calories: 510, protein: 24, carbs: 60, fat: 20, fiber: 5, sodium: 720 },
    allergens: ["dairy"],
    ingredients: [
      { ingredientId: map["Paneer Tikka"]._id, name: "Paneer Tikka", price: 60, required: true },
      { ingredientId: map["Jasmine Rice"]._id, name: "Jasmine Rice", price: 25, required: true },
      { ingredientId: map["Peri Sauce"]._id, name: "Peri Sauce", price: 12, required: false },
      { ingredientId: map["Crispy Onions"]._id, name: "Crispy Onions", price: 20, required: false },
    ],
    isActive: true,
  },
  {
    name: "Avocado Crunch Salad",
    description: "Avocado, corn salsa, roasted veggies, garlic aioli.",
    category: "Salads",
    basePrice: 190,
    nutrition: { calories: 420, protein: 10, carbs: 44, fat: 18, fiber: 9, sodium: 430 },
    allergens: ["garlic"],
    ingredients: [
      { ingredientId: map["Avocado"]._id, name: "Avocado", price: 45, required: true },
      { ingredientId: map["Corn Salsa"]._id, name: "Corn Salsa", price: 18, required: false },
      { ingredientId: map["Roasted Veggies"]._id, name: "Roasted Veggies", price: 30, required: true },
      { ingredientId: map["Garlic Aioli"]._id, name: "Garlic Aioli", price: 16, required: false },
    ],
    isActive: true,
  },
  {
    name: "Smoky Chicken Wrap",
    description: "Smoky chicken, corn salsa, aioli, crunchy onions.",
    category: "Wraps",
    basePrice: 185,
    nutrition: { calories: 470, protein: 28, carbs: 52, fat: 16, fiber: 4, sodium: 690 },
    allergens: ["gluten"],
    ingredients: [
      { ingredientId: map["Smoky Chicken"]._id, name: "Smoky Chicken", price: 70, required: true },
      { ingredientId: map["Corn Salsa"]._id, name: "Corn Salsa", price: 18, required: false },
      { ingredientId: map["Garlic Aioli"]._id, name: "Garlic Aioli", price: 16, required: false },
      { ingredientId: map["Crispy Onions"]._id, name: "Crispy Onions", price: 20, required: false },
    ],
    isActive: true,
  },
  {
    name: "Herb Paneer Ricebox",
    description: "Herb paneer, jasmine rice, peri sauce, veggies.",
    category: "Ricebox",
    basePrice: 205,
    nutrition: { calories: 520, protein: 22, carbs: 66, fat: 17, fiber: 6, sodium: 640 },
    allergens: ["dairy"],
    ingredients: [
      { ingredientId: map["Herb Paneer"]._id, name: "Herb Paneer", price: 65, required: true },
      { ingredientId: map["Jasmine Rice"]._id, name: "Jasmine Rice", price: 25, required: true },
      { ingredientId: map["Roasted Veggies"]._id, name: "Roasted Veggies", price: 30, required: false },
      { ingredientId: map["Peri Sauce"]._id, name: "Peri Sauce", price: 12, required: false },
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
  {
    name: "Family Feast",
    description: "Three mains + sauces for the table.",
    items: items.slice(0, 3).map((i) => ({ itemId: i._id, name: i.name })),
    price: 560,
    nutrition: { calories: 1420, protein: 78, carbs: 170, fat: 48 },
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
    supplier: {
      name: "FreshFarm Suppliers",
      phone: "+91-90000-11111",
      email: "orders@freshfarm.io",
      lastRestockAt: new Date(),
    },
  }))
);

const passwordUser = await bcrypt.hash("User@123", 10);
const passwordAdmin = await bcrypt.hash("Admin@123", 10);
await User.insertMany([
  {
    name: "Demo User",
    email: "user@demo.com",
    passwordHash: passwordUser,
    role: "user",
    orderCount: 0,
    lastOrderAt: null,
    streak: 0,
  },
  {
    name: "Demo Admin",
    email: "admin@demo.com",
    passwordHash: passwordAdmin,
    role: "admin",
    orderCount: 0,
    lastOrderAt: null,
    streak: 0,
  },
]);

console.log("Seed complete.");
await mongoose.disconnect();

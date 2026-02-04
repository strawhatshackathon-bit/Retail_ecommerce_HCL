import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/hackathon";
await mongoose.connect(dbUrl);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    orderCount: { type: Number, default: 0 },
    lastOrderAt: { type: Date, default: null },
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const signToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );
};

app.post("/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: "Email exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role === "admin" ? "admin" : "user",
  });
  const token = signToken(user);
  return res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken(user);
  return res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
});

app.get("/auth/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      orderCount: user.orderCount,
      streak: user.streak,
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.patch("/auth/users/:id/stats", async (req, res) => {
  const { id } = req.params;
  const { orderCount, lastOrderAt, streak } = req.body || {};
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { orderCount, lastOrderAt, streak } },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: user._id, orderCount: user.orderCount, streak: user.streak });
});

app.get("/auth/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Auth service on ${PORT}`));

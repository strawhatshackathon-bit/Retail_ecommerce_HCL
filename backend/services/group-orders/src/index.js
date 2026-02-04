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

const groupOrderSchema = new mongoose.Schema(
  {
    code: String,
    hostUserId: String,
    members: [
      {
        userId: String,
        name: String,
        items: Array,
        total: Number,
      },
    ],
    status: { type: String, default: "open" },
  },
  { timestamps: true }
);

const GroupOrder = mongoose.model("GroupOrder", groupOrderSchema);

const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

app.post("/group-orders", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const name = req.headers["x-user-name"] || "Host";
  const group = await GroupOrder.create({
    code: makeCode(),
    hostUserId: userId,
    members: [{ userId, name, items: [], total: 0 }],
  });
  res.status(201).json(group);
});

app.post("/group-orders/join", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const name = req.headers["x-user-name"] || "Member";
  const { code } = req.body || {};
  const group = await GroupOrder.findOne({ code, status: "open" });
  if (!group) return res.status(404).json({ error: "Not found" });
  if (!group.members.find((m) => m.userId === userId)) {
    group.members.push({ userId, name, items: [], total: 0 });
    await group.save();
  }
  res.json(group);
});

app.post("/group-orders/:id/items", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { items, total } = req.body || {};
  const group = await GroupOrder.findById(req.params.id);
  if (!group) return res.status(404).json({ error: "Not found" });
  const member = group.members.find((m) => m.userId === userId);
  if (!member) return res.status(403).json({ error: "Join first" });
  member.items = items;
  member.total = total;
  await group.save();
  res.json(group);
});

app.post("/group-orders/:id/checkout", async (req, res) => {
  const group = await GroupOrder.findById(req.params.id);
  if (!group) return res.status(404).json({ error: "Not found" });
  group.status = "closed";
  await group.save();
  res.json(group);
});

app.get("/group-orders/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => console.log(`Group orders service on ${PORT}`));

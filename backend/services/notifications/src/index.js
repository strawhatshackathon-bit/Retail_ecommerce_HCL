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

const notificationSchema = new mongoose.Schema(
  {
    type: String,
    message: String,
    payload: Object,
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

app.post("/notifications/order-confirmed", async (req, res) => {
  const note = await Notification.create({
    type: "order-confirmed",
    message: "Order confirmed",
    payload: req.body || {},
  });
  res.status(201).json(note);
});

app.post("/notifications/low-stock", async (req, res) => {
  const note = await Notification.create({
    type: "low-stock",
    message: "Low stock alert",
    payload: req.body || {},
  });
  res.status(201).json(note);
});

app.get("/notifications", async (_req, res) => {
  const notes = await Notification.find().sort({ createdAt: -1 });
  res.json(notes);
});

app.get("/notifications/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4006;
app.listen(PORT, () => console.log(`Notifications service on ${PORT}`));

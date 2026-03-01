import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI not defined");
}

// Global cache (important for serverless)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now }
});

const Location =
  mongoose.models.Location || mongoose.model("Location", locationSchema);

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { latitude, longitude } = req.body;

    const newLocation = new Location({ latitude, longitude });
    await newLocation.save();

    res.status(200).json({ message: "Location saved successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGO_URI);
}

const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Location =
  mongoose.models.Location || mongoose.model("Location", locationSchema);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { latitude, longitude } = req.body;

    const newLocation = new Location({
      latitude,
      longitude,
    });

    await newLocation.save();

    res.status(200).json({ message: "Location saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error saving location" });
  }
}
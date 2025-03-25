import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth/authRoutes.js";
import reviewRoutes from "./routes/review/reviewRoutes.js";
import connectToDB from "./lib/database/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDB();
});

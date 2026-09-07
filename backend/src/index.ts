import express from "express";
import cors from "cors";
import playerRoutes from "./routes/playerRoutes.js";
import matchRequestRoutes from "./routes/matchRequestRoutes.js";
import { db } from "./config/firebase.js";
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/players", playerRoutes);
app.use("/match-requests", matchRequestRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "SportLink backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`SportLink backend running at http://localhost:${PORT}`);
});
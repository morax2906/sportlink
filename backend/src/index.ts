import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "SportLink backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`SportLink backend running at http://localhost:${PORT}`);
});
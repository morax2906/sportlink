import { Router } from "express";

const router = Router();

router.get("/:id", (req, res) => {
  const player = {
    id: req.params.id,
    name: "Test Player",
    elo: 1000,
  };

  res.json(player);
});

export default router;
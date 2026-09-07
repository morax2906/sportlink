import { Router } from "express";
import { createMatchRequest } from "../services/matchRequestService.js";
import { db } from "../config/firebase.js";
const router = Router();
router.get("/", async (_req, res) => {
  try {
    const snapshot = await db
      .collection("matchRequests")
      .where("status", "==", "pending")
      .get();

    const matchRequests = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json(matchRequests);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get match requests",
    });
  }
});
router.post("/", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { playerId, sport, desiredTime, location } = req.body ?? {};

    if (!playerId || !sport || !desiredTime) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const matchRequest = await createMatchRequest({
      playerId,
      sport,
      desiredTime,
      location: location ?? undefined,
    });

    return res.status(201).json(matchRequest);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create match request",
    });
  }
});

export default router;
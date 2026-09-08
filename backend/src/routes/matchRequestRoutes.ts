import { Router } from "express";
import { createMatchRequest } from "../services/matchRequestService.js";
import { db } from "../config/firebase.js";
import { tryCreateMatch } from "../services/matchingService.js";
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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db
      .collection("matchRequests")
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        message: "Match request not found",
      });
    }

    const matchRequest = doc.data();

if (matchRequest?.status === "matched" && matchRequest.matchId) {
  const matchDoc = await db
    .collection("matches")
    .doc(matchRequest.matchId)
    .get();

  if (matchDoc.exists) {
    return res.status(200).json({
      ...matchRequest,
      match: matchDoc.data(),
    });
  }
}

return res.status(200).json({
  ...matchRequest,
  match: null,
});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get match request",
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const { playerId, sport, desiredTime, location } = req.body ?? {};

    if (!playerId || !sport || !desiredTime) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // 1. Tạo Match Request
    const matchRequest = await createMatchRequest({
      playerId,
      sport,
      desiredTime,
      location: location ?? undefined,
    });

    // 2. Thử matching ngay sau khi tạo request
    const match = await tryCreateMatch(sport);

    return res.status(201).json({
      matchRequest,
      match,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create match request",
    });
  }
});

export default router;
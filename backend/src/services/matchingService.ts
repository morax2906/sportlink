import { db } from "../config/firebase.js";
import type { Match, MatchRequest } from "@sportlink/shared";
const PLAYERS_PER_MATCH = 4;

export async function tryCreateMatch(
  sport: string
): Promise<Match | null> {
const snapshot = await db
  .collection("matchRequests")
  .where("sport", "==", sport)
  .where("status", "==", "pending")
  .orderBy("createdAt", "asc")
  .get();

  if (snapshot.size < PLAYERS_PER_MATCH) {
    return null;
  }

  // Lấy 4 request đầu tiên trong queue
  const selectedDocs = snapshot.docs.slice(0, PLAYERS_PER_MATCH);

  const requests = selectedDocs.map(
    (doc) => doc.data() as MatchRequest
  );

  const matchRef = db.collection("matches").doc();

  const match: Match & { playerIds: string[] } = {
    id: matchRef.id,
    sport,
    startTime: requests[0].desiredTime,
    status: "confirmed",
    playerIds: requests.map((request) => request.playerId),
  };

  const batch = db.batch();

  // Tạo Match
  batch.set(matchRef, {
    ...match,
    createdAt: new Date().toISOString(),
  });

  // Đổi trạng thái 4 request
  for (const doc of selectedDocs) {
    batch.update(doc.ref, {
      status: "matched",
      matchId: match.id,
    });
  }

  await batch.commit();

  return match;
}
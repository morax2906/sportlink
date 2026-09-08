import { db } from "../config/firebase.js";
import type {Match, MatchRequest } from "@sportlink/shared";

export async function createMatchRequest(
  data: Omit<MatchRequest, "id" | "status">
): Promise<MatchRequest> {
  const docRef = db.collection("matchRequests").doc();

  const matchRequest: MatchRequest = {
    id: docRef.id,
    ...data,
    status: "pending",
  };

  await docRef.set({
    ...matchRequest,
    createdAt: new Date().toISOString(),
  });

  return matchRequest;
}

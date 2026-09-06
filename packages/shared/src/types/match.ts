export interface MatchRequest {
  id: string;
  playerId: string;
  sport: string;
  desiredTime: string;
  location?: string;
  status: "pending" | "matched" | "cancelled";
}

export interface Match {
  id: string;
  sport: string;
  startTime: string;
  status: "forming" | "confirmed" | "completed" | "cancelled";
}

export interface MatchPlayer {
  matchId: string;
  playerId: string;
  status: "joined" | "confirmed" | "left";
  result?: "win" | "lose" | "draw";
}
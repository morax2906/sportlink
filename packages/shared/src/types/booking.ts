export interface Booking {
  id: string;
  matchId: string;
  slotId: string;
  status: "pending" | "confirmed" | "cancelled";
}
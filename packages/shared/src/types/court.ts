export interface Court {
  id: string;
  ownerId: string;
  name: string;
  sport: string;
  location: string;
}

export interface CourtSlot {
  id: string;
  courtId: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked";
}
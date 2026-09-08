import { apiGet } from "./api";
import type { Player } from "../../../packages/shared/src/types/player";

export function getPlayer(id: string) {
  return apiGet<Player>(`/players/${id}`);
}
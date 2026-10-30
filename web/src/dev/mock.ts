import en from "../../../locales/en.json";
import type { AlertCard } from "../../../resource/common/nui";

/** Browser preview only (`bun run webdev`): three alerts, the newest a high-priority shot alert. */
export const MOCK_TEXTS: Record<string, string> = en;
const now = Date.now();
export const MOCK_CARDS: AlertCard[] = [
  {
    id: 14,
    code: "10-71",
    title: "Shots fired",
    message: null,
    street: "Vespucci Blvd | Elgin Ave",
    zone: "Pillbox Hill",
    icon: "gun",
    high: true,
    at: now,
    cardMs: 600_000,
    waypointKey: "J",
  },
  {
    id: 13,
    code: "10-90",
    title: "Robbery in progress",
    message: "24/7 Supermarket",
    street: "Innocence Blvd",
    zone: "Strawberry",
    icon: "shop",
    high: false,
    at: now - 60_000,
    cardMs: 600_000,
    waypointKey: "J",
  },
  {
    id: 12,
    code: null,
    title: "Suspicious hand-off reported",
    message: null,
    street: "Grove St",
    zone: "Davis",
    icon: "cannabis",
    high: false,
    at: now - 180_000,
    cardMs: 600_000,
    waypointKey: "J",
  },
];

import {
  bool,
  int,
  num,
  readFinite,
  readText,
  record,
  str,
} from "@aicore-fivem/lib/shared";

/** ai-policealert's contracts and panel content. No natives. */

export const EVENTS = {
  /** Server -> an on-duty member: (PoliceAlert[]) every live alert of the new duty job (snapshot, empty when off duty). */
  alerts: "ai-policealert:client:alerts",
  /** Server -> on-duty members of the alert's jobs: (PoliceAlert) one new alert (delta). */
  alert: "ai-policealert:client:alert",
} as const;

/** One alert as it travels to an officer's client; it expires there on the client clock after `ttl` ms. */
export interface PoliceAlert {
  id: number;
  code: string | null;
  title: string;
  message: string | null;
  coords: { x: number; y: number; z: number } | null;
  blip: { sprite: number; color: number; scale: number };
  icon: string;
  high: boolean;
  /** Milliseconds since it was sent (the card shows the clock time it came in). */
  age: number;
  /** Milliseconds it still lives (card, blip, waypoint key). */
  ttl: number;
}

/** A server-sent alert, checked on the client. */
export function toPoliceAlert(value: unknown): PoliceAlert | null {
  const v = record(value);
  const c = record(v.coords);
  const b = record(v.blip);
  const title = readText(v.title, 80);
  const id = readFinite(v.id);
  const ttl = readFinite(v.ttl);
  const [x, y, z] = [readFinite(c.x), readFinite(c.y), readFinite(c.z)];
  if (id === null || !title || ttl === null) return null;
  return {
    id,
    code: readText(v.code, 12),
    title,
    message: readText(v.message, 160),
    coords: x !== null && y !== null && z !== null ? { x, y, z } : null,
    blip: {
      sprite: int(b.sprite, 161, 0, 1000),
      color: int(b.color, 1, 0, 100),
      scale: num(b.scale, 1),
    },
    icon: str(v.icon, "triangle-exclamation", 40),
    high: v.high === true,
    age: Math.max(0, num(v.age, 0)),
    ttl: Math.max(0, ttl),
  };
}

export interface Settings {
  /** Jobs whose on-duty members get an alert that names no jobs. */
  jobs: string[];
  /** How long an alert lives (blip, waypoint key) unless the alert names its own time. */
  alertSeconds: number;
  /** How long the alert card stays on screen. */
  cardSeconds: number;
  /** A sound plays when a card comes in. */
  sound: boolean;
  /** Most live alerts an officer holds (snapshot and client feed keep the newest). */
  maxAlerts: number;
}

const names = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export function readSettings(raw: unknown): Settings {
  const s = record(raw);
  return {
    jobs: names(s.jobs).length ? names(s.jobs) : ["police"],
    alertSeconds: int(s.alertSeconds, 60, 10, 600),
    cardSeconds: int(s.cardSeconds, 8, 2, 60),
    sound: bool(s.sound, true),
    maxAlerts: int(s.maxAlerts, 30, 5, 100),
  };
}

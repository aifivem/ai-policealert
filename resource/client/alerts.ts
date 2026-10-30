import {
  createBlip,
  Keybind,
  loadLocaleTexts,
  locationName,
  notify,
  onServerEvent,
} from "@aicore-fivem/lib/client";
import { Locale } from "common";
import {
  EVENTS,
  toPoliceAlert,
  type PoliceAlert,
  type Settings,
} from "common/alerts";
import type { AlertCard, NuiMessage } from "common/nui";

const send = (m: NuiMessage): void => SendNUIMessage(m);

interface Shown {
  alert: PoliceAlert;
  blip: number | null;
  timer: ReturnType<typeof setTimeout>;
}

/** Street (with the crossing) and zone name at a point. */
function placeOf(c: { x: number; y: number; z: number }): {
  street: string | null;
  zone: string | null;
} {
  const place = locationName(c);
  const names = [place.street, place.crossing ?? ""].filter(Boolean);
  return {
    street: names.length ? names.join(" | ") : null,
    zone: place.zone || null,
  };
}

/**
 * The officer's live alerts: a card on the NUI, a blip and the waypoint key, each removed when the alert's time ends
 * on this client's clock. Fed by the server's snapshot (duty change) and deltas (new alerts).
 */
class AlertFeed {
  private readonly shown = new Map<number, Shown>();
  /** The newest live alert: the waypoint key acts on it. */
  private newest: Shown | null = null;
  private textsSent = false;

  constructor(
    private readonly settings: () => Settings,
    private readonly waypointKey: () => string,
  ) {}

  /** Replaces every alert (snapshot); the cards of older alerts do not pop up again. */
  set(list: PoliceAlert[]): void {
    for (const id of this.shown.keys()) this.remove(id);
    send({ action: "clear", data: null });
    for (const alert of list) this.add(alert, false);
  }

  add(alert: PoliceAlert, fresh = true): void {
    if (alert.ttl <= 0) return;
    this.remove(alert.id);
    // At most `maxAlerts` blips and timers: the oldest live alert makes room (Map order = arrival order).
    while (this.shown.size >= this.settings().maxAlerts) {
      const oldest = this.shown.keys().next().value;
      if (oldest === undefined) break;
      this.remove(oldest);
    }
    const blip = alert.coords
      ? createBlip({
          coords: alert.coords,
          label: alert.title,
          sprite: alert.blip.sprite,
          color: alert.blip.color,
          scale: alert.blip.scale,
          shortRange: false,
        })
      : null;
    if (blip !== null && alert.high) SetBlipFlashes(blip, true);
    const entry: Shown = {
      alert,
      blip,
      timer: setTimeout(() => this.remove(alert.id), alert.ttl),
    };
    this.shown.set(alert.id, entry);
    if (!this.newest || alert.id > this.newest.alert.id) this.newest = entry;
    const cardMs = Math.min(
      alert.ttl,
      this.settings().cardSeconds * 1000 - alert.age,
    );
    if (!fresh || cardMs <= 0) return;
    this.sendTexts();
    send({ action: "add", data: this.card(alert, cardMs) });
    if (this.settings().sound)
      PlaySoundFrontend(
        -1,
        "Event_Start_Text",
        "GTAO_FM_Events_Soundset",
        false,
      );
  }

  remove(id: number): void {
    const entry = this.shown.get(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    if (entry.blip !== null) RemoveBlip(entry.blip);
    this.shown.delete(id);
    send({ action: "remove", data: id });
    if (this.newest === entry) {
      this.newest = null;
      for (const other of this.shown.values())
        if (!this.newest || other.alert.id > this.newest.alert.id)
          this.newest = other;
    }
  }

  waypoint(): void {
    const coords = this.newest?.alert.coords;
    if (!coords) return;
    SetNewWaypoint(coords.x, coords.y);
    notify(Locale("ALERT_WAYPOINT_SET"), "success");
  }

  private card(alert: PoliceAlert, cardMs: number): AlertCard {
    const place = alert.coords
      ? placeOf(alert.coords)
      : { street: null, zone: null };
    return {
      id: alert.id,
      code: alert.code,
      title: alert.title,
      message: alert.message,
      street: place.street,
      zone: place.zone,
      icon: alert.icon,
      high: alert.high,
      at: Date.now() - alert.age,
      cardMs,
      waypointKey: alert.coords ? this.waypointKey() : "",
    };
  }

  private sendTexts(): void {
    if (this.textsSent) return;
    this.textsSent = true;
    send({ action: "texts", data: loadLocaleTexts() });
  }
}

/** Starts the alert cards; `settings` reads the panel's settings. */
export function startAlerts(settings: () => Settings): void {
  const key = new Keybind({
    name: "police_alert_waypoint",
    description: Locale("KEYBIND_WAYPOINT"),
    defaultKey: "J",
    onPressed: () => feed.waypoint(),
  });
  const feed = new AlertFeed(settings, () => key.currentKey);
  onServerEvent(
    EVENTS.alerts,
    {
      args: ([list]) =>
        Array.isArray(list)
          ? [
              list
                .map(toPoliceAlert)
                .filter((a): a is PoliceAlert => a !== null),
            ]
          : null,
    },
    (list) => feed.set(list),
  );
  onServerEvent(
    EVENTS.alert,
    {
      args: ([raw]) => {
        const alert = toPoliceAlert(raw);
        return alert ? [alert] : null;
      },
    },
    (alert) => feed.add(alert),
  );
}

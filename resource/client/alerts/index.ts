import { AdminWorld, Keybind, onServerEvent } from "@aicore-fivem/lib/client";
import { NUI_LAYER } from "@aicore-fivem/shared";
import { Locale } from "common";
import {
  EVENTS,
  readSettings,
  toPoliceAlert,
  type PoliceAlert,
} from "common/alerts";
import { AlertFeed } from "./feed";

// Stacking among NUI pages (`NUI_LAYER`): set at start, not left to load order.
SetNuiZindex(NUI_LAYER.alert);

const world = new AdminWorld(["settings"]);

const settings = world.view("settings", readSettings);

// The alert cards and the waypoint key.
const key = new Keybind({
  name: "police_alert_waypoint",
  description: Locale("KEYBIND_WAYPOINT"),
  defaultKey: "J",
  onPressed: () => feed.waypoint(),
});
const feed = new AlertFeed(
  () => settings.value,
  () => key.currentKey,
);
onServerEvent(
  EVENTS.alerts,
  {
    args: ([list]) =>
      Array.isArray(list)
        ? [list.map(toPoliceAlert).filter((a): a is PoliceAlert => a !== null)]
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

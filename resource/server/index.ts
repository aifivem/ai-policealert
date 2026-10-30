import { AdminPanel } from "@aicore-fivem/lib/server";
import { readSettings } from "common/alerts";
import { AlertBoard, startAlerts } from "./alerts";
import { alertSchema } from "./schema";

const panel = new AdminPanel(alertSchema);
/** Panel content, parsed again after every change. */
const content = { settings: readSettings(panel.get("settings")) };
panel.onChange(
  "settings",
  () => (content.settings = readSettings(panel.get("settings"))),
);

startAlerts(new AlertBoard(() => content.settings));

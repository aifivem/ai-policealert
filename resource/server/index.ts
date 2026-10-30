import { AdminPanel } from "@aicore-fivem/lib/server";
import { readSettings } from "common/alerts";
import { AlertBoard, startAlerts } from "./alerts";
import { alertSchema } from "./schema";

const panel = new AdminPanel(alertSchema);
/** Panel settings, kept current by the panel. */
const settings = panel.view("settings", readSettings);

startAlerts(new AlertBoard(() => settings.value));

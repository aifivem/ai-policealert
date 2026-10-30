import { AdminWorld } from "@aicore-fivem/lib/client";
import { readSettings } from "common/alerts";
import { startAlerts } from "./alerts";

const world = new AdminWorld(["settings"]);

const settings = world.view("settings", readSettings);

startAlerts(() => settings.value);

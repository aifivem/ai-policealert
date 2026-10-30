import { AdminWorld } from "@aicore-fivem/lib/client";
import { readSettings } from "common/alerts";
import { startAlerts } from "./alerts";

const world = new AdminWorld(["settings"]);

startAlerts(() => readSettings(world.get("settings")));

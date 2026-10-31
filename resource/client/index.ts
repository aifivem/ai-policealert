import { AdminWorld } from "@aicore-fivem/lib/client";
import { readSettings } from "common/alerts";
import { startAlerts } from "./alerts";
import { NUI_LAYER } from "@aicore-fivem/shared";

// Stacking among NUI pages (`NUI_LAYER`): set at start, not left to load order.
SetNuiZindex(NUI_LAYER.alert);

const world = new AdminWorld(["settings"]);

const settings = world.view("settings", readSettings);

startAlerts(() => settings.value);

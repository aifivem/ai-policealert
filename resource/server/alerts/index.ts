import {
  AdminPanel,
  onCharacter,
  registerExport,
} from "@aicore-fivem/lib/server";
import { CORE, toDispatchAlert } from "@aicore-fivem/shared";
import { readSettings } from "common/alerts";
import { alertSchema } from "../schema";
import { AlertBoard } from "./board";

const panel = new AdminPanel(alertSchema);
/** Panel settings, kept current by the panel. */
const settings = panel.view("settings", readSettings);
const board = new AlertBoard(() => settings.value);

// Registers the board's export (ai-core's dispatch layer calls it) and the duty / leave listeners.
registerExport("DispatchAlert", (raw: unknown) => {
  const alert = toDispatchAlert(raw);
  if (alert) board.add(alert);
});
on(CORE.dutyChangedEvent, (source: number, job: string | null) =>
  board.dutyChanged(source, job),
);
onCharacter({
  unloaded: (source, _charId, reason) =>
    reason === "switch" ? board.dutyChanged(source, null) : board.drop(source),
});

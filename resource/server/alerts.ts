import { online, registerExport } from "@aicore-fivem/lib/server";
import { CORE, toDispatchAlert, type DispatchAlert } from "@aicore-fivem/shared";
import { EVENTS, type PoliceAlert } from "common/alerts";

/** Default blip of an alert that names none: a red pulse. */
const BLIP = { sprite: 161, color: 1, scale: 1.2 };

interface LiveAlert {
  alert: DispatchAlert;
  id: number;
  /** null = the panel's police jobs at send time. */
  jobs: string[] | null;
  created: number;
  expires: number;
}

/**
 * The built-in alert cards' server side (ai-core's dispatch layer hands alerts in through `DispatchAlert` while
 * ai-policealert is the active alert system). Live alerts stay in memory until they expire; an officer gets a snapshot of
 * their job's live alerts on going on duty, then each new alert as a delta. Expiry runs on the client clock.
 */
export class AlertBoard {
  private readonly live = new Map<number, LiveAlert>();
  /** Players whose client holds alerts: they get an (empty) snapshot when their duty changes. */
  private readonly holders = new Set<number>();
  private nextId = 0;

  constructor(
    private readonly settings: () => {
      jobs: string[];
      alertSeconds: number;
    },
  ) {}

  add(alert: DispatchAlert): void {
    const now = Date.now();
    this.prune(now);
    const duration = (alert.duration ?? this.settings().alertSeconds) * 1000;
    const live: LiveAlert = {
      alert,
      id: ++this.nextId,
      jobs: alert.jobs ?? null,
      created: now,
      expires: now + duration,
    };
    this.live.set(live.id, live);
    const wire = this.wire(live, now);
    // Only the on-duty sets of the alert's jobs (one duty job per player, so nobody gets it twice).
    for (const job of this.jobsOf(live))
      for (const officer of online.onDutyFor(job)) {
        emitNet(EVENTS.alert, officer, wire);
        this.holders.add(officer);
      }
  }

  /** Sends a player the live alerts of their (new) duty job; clears their cards when they hold some and have none now. */
  dutyChanged(source: number, job: string | null): void {
    const now = Date.now();
    this.prune(now);
    const list = job
      ? [...this.live.values()]
          .filter((l) => this.jobsOf(l).includes(job))
          .map((l) => this.wire(l, now))
      : [];
    if (!list.length && !this.holders.has(source)) return;
    emitNet(EVENTS.alerts, source, list);
    if (list.length) this.holders.add(source);
    else this.holders.delete(source);
  }

  drop(source: number): void {
    this.holders.delete(source);
  }

  private jobsOf(live: LiveAlert): string[] {
    return live.jobs ?? this.settings().jobs;
  }

  private prune(now: number): void {
    for (const [id, live] of this.live)
      if (live.expires <= now) this.live.delete(id);
  }

  private wire(live: LiveAlert, now: number): PoliceAlert {
    const a = live.alert;
    return {
      id: live.id,
      code: a.code ?? null,
      title: a.title,
      message: a.message ?? null,
      coords: a.coords ?? null,
      blip: {
        sprite: a.blip?.sprite ?? BLIP.sprite,
        color: a.blip?.color ?? BLIP.color,
        scale: a.blip?.scale ?? BLIP.scale,
      },
      icon: a.icon ?? "triangle-exclamation",
      high: a.priority === "high",
      age: now - live.created,
      ttl: live.expires - now,
    };
  }
}

/** Registers the board's export (ai-core's dispatch layer calls it) and the duty / leave listeners. */
export function startAlerts(board: AlertBoard): void {
  registerExport("DispatchAlert", (raw: unknown) => {
    const alert = toDispatchAlert(raw);
    if (alert) board.add(alert);
  });
  on(CORE.dutyChangedEvent, (source: number, job: string | null) =>
    board.dutyChanged(source, job),
  );
  on(
    CORE.playerUnloadedEvent,
    (source: number, _charId: unknown, reason: unknown) =>
      reason === "switch"
        ? board.dutyChanged(source, null)
        : board.drop(source),
  );
  on("playerDropped", () => board.drop(Number(globalThis.source)));
}

import { online, PlayerMap } from "@aicore-fivem/lib/server";
import type { DispatchAlert } from "@aicore-fivem/shared";
import { EVENTS, type PoliceAlert, type Settings } from "common/alerts";

/** Live alerts the board keeps at most over every job (the oldest goes first); officers get at most `maxAlerts`. */
const BOARD_MAX = 1000;

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
  /** Insertion order = id order: the first entry is the oldest. */
  private readonly live = new Map<number, LiveAlert>();
  /** Players whose client holds alerts: they get an (empty) snapshot when their duty changes. */
  private readonly holders = new PlayerMap<true>();
  private nextId = 0;

  constructor(
    private readonly settings: () => Pick<
      Settings,
      "jobs" | "alertSeconds" | "maxAlerts" | "blip"
    >,
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
    if (this.live.size > BOARD_MAX)
      this.live.delete(this.live.keys().next().value as number);
    const wire = this.wire(live, now);
    // Only the on-duty sets of the alert's jobs (one duty job per player, so nobody gets it twice).
    for (const job of this.jobsOf(live))
      for (const officer of online.onDutyFor(job)) {
        emitNet(EVENTS.alert, officer, wire);
        this.holders.set(officer, true);
      }
  }

  /**
   * Sends a player the newest `maxAlerts` live alerts of their (new) duty job; clears their cards when they hold some
   * and have none now.
   */
  dutyChanged(source: number, job: string | null): void {
    const now = Date.now();
    this.prune(now);
    const list: PoliceAlert[] = [];
    if (job) {
      const max = this.settings().maxAlerts;
      const all = [...this.live.values()];
      for (let i = all.length - 1; i >= 0 && list.length < max; i--) {
        const live = all[i] as LiveAlert;
        if (this.jobsOf(live).includes(job)) list.push(this.wire(live, now));
      }
      list.reverse();
    }
    if (!list.length && !this.holders.has(source)) return;
    emitNet(EVENTS.alerts, source, list);
    if (list.length) this.holders.set(source, true);
    else this.holders.delete(source);
  }

  drop(source: number): void {
    this.holders.delete(source);
  }

  private jobsOf(live: LiveAlert): string[] {
    return live.jobs ?? this.settings().jobs;
  }

  /** Alerts carry their own durations, so an expired one can sit behind a live one: every entry is checked. */
  private prune(now: number): void {
    for (const [id, live] of this.live)
      if (live.expires <= now) this.live.delete(id);
  }

  private wire(live: LiveAlert, now: number): PoliceAlert {
    const a = live.alert;
    const blip = this.settings().blip;
    return {
      id: live.id,
      code: a.code ?? null,
      title: a.title,
      message: a.message ?? null,
      coords: a.coords ?? null,
      blip: {
        sprite: a.blip?.sprite ?? blip.sprite,
        color: a.blip?.color ?? blip.color,
        scale: a.blip?.scale ?? blip.scale,
      },
      icon: a.icon ?? "triangle-exclamation",
      high: a.priority === "high",
      age: now - live.created,
      ttl: live.expires - now,
    };
  }
}

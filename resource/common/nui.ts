/** The alert cards' NUI contract (client -> web). No natives. */

/** One alert card as the web shows it; times are the client's clock. */
export interface AlertCard {
  id: number;
  code: string | null;
  title: string;
  message: string | null;
  /** Street (and crossing) at the alert's point, read on the officer's client. */
  street: string | null;
  /** Zone name at the alert's point. */
  zone: string | null;
  icon: string;
  high: boolean;
  /** When the alert came in (epoch ms), shown as a clock time. */
  at: number;
  /** How long the card stays on screen (ms); the alert itself may live longer. */
  cardMs: number;
  /** The waypoint key the player has bound; "" when the alert has no point. */
  waypointKey: string;
}

export type NuiMessage =
  | { action: "texts"; data: Record<string, string> }
  | { action: "add"; data: AlertCard }
  | { action: "remove"; data: number }
  | { action: "clear"; data: null };

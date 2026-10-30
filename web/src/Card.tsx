import { useEffect, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faClock,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { AlertCard } from "../../resource/common/nui";
import { iconOf } from "./lib/icons";
import { useLang } from "./lib/lang";

const clock = (at: number) => {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function Row({ icon, children }: { icon: IconDefinition; children: ReactNode }) {
  return (
    <div className="flex items-center gap-[0.6vh] text-[1.3vh] text-text-2">
      <FontAwesomeIcon icon={icon} className="w-[1.6vh] text-[1.4vh]" />
      {children}
    </div>
  );
}

/**
 * One alert (tgiann-policealert's AlertBox): code chip, title and number, glowing icon; time, place and message rows;
 * the waypoint key on the newest card; a bar that drains over the card time. High alerts blink red.
 */
export function Card({
  card,
  newest,
  onDone,
}: {
  card: AlertCard;
  newest: boolean;
  onDone: (id: number) => void;
}) {
  const t = useLang();

  useEffect(() => {
    const timer = setTimeout(() => onDone(card.id), card.cardMs);
    return () => clearTimeout(timer);
  }, [card.id, card.cardMs, onDone]);

  return (
    <div className="relative overflow-hidden rounded-[1.2vh] bg-alert p-[1vh] pb-[1.3vh] text-white">
      {card.high && (
        <div className="pointer-events-none absolute inset-0 animate-blink bg-alert-high will-change-[opacity]" />
      )}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between gap-[1vh]">
          <div className="flex min-w-0 items-center gap-[0.6vh]">
            {card.code && (
              <span className="shrink-0 rounded-[0.3vh] bg-alert-code px-[0.5vh] text-[1.2vh] font-medium">
                {card.code}
              </span>
            )}
            <span className="truncate text-[1.4vh] font-semibold uppercase">
              {card.title}
            </span>
            <span className="shrink-0 text-[1.2vh] font-semibold text-white/40">
              #{card.id}
            </span>
          </div>
          <FontAwesomeIcon
            icon={iconOf(card.icon)}
            className={`mr-[0.4vh] shrink-0 text-[2vh] [filter:drop-shadow(0_0_0.5vh_currentColor)] ${card.high ? "text-danger" : "text-alert-icon"}`}
          />
        </div>
        <div className="my-[0.9vh] h-[0.2vh] w-full bg-white/10" />
        <div className="flex flex-col gap-[0.5vh]">
          <Row icon={faClock}>
            <span className="font-medium tabular-nums">{clock(card.at)}</span>
          </Row>
          {(card.street || card.zone) && (
            <Row icon={faLocationDot}>
              <span className="truncate font-bold text-white">
                {card.street ?? t("UI_ALERT_UNKNOWN")}
              </span>
              {card.zone && (
                <span className="truncate uppercase">{card.zone}</span>
              )}
            </Row>
          )}
          {card.message && (
            <Row icon={faCircleInfo}>
              <span className="font-bold text-white uppercase">
                {card.message}
              </span>
            </Row>
          )}
        </div>
        {newest && card.waypointKey && (
          <>
            <div className="my-[0.9vh] h-[0.2vh] w-full bg-white/10" />
            <div className="flex items-center gap-[0.6vh] text-[1.2vh]">
              <span className="flex h-[2.4vh] min-w-[2.4vh] items-center justify-center rounded-[0.3vh] bg-white/10 px-[0.5vh] font-extrabold text-tgi-green">
                {card.waypointKey}
              </span>
              <span className="text-text-2 uppercase">
                {t("UI_ALERT_WAYPOINT")}
              </span>
            </div>
          </>
        )}
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-[0.3vh] origin-left bg-white/40"
        style={{ animation: `drain ${card.cardMs}ms linear forwards` }}
      />
    </div>
  );
}

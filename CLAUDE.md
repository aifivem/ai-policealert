# ai-policealert

The built-in police alert system: ai-core's dispatch layer hands it every alert (lib `dispatch.alert`) while it is the active alert system (ai-core panel "Police alerts"; `auto` picks an installed third-party alert script first), and on-duty members of the alert's jobs get a card, a blip and a waypoint key. Depends on ai-core (duty, keybinds, notifications, panel). Layer and adapters: `docs/compat/dispatch.md`.

## Decisions

- Its own resource (owner decision), not part of ai-police: a server can swap the alert system without touching police work, and ai-police's shot alerts go through lib `dispatch` like every other script's.
- Its own panel: default alert jobs (for alerts that name none), alert time (blip and waypoint key), card time, sound, and the blip of an alert that names none (lib `BLIP_STYLE_FIELDS` / `readBlipStyle`; default qb-policejob's alert blip: sprite 60, red, 0.8; high priority alerts flash).
- The server keeps live alerts in memory until they expire (at most 1000 over every job, the oldest goes first); nothing is stored. An officer holds at most the panel's `maxAlerts` (default 30): the duty snapshot carries the newest ones of the job and the client feed drops its oldest blip, timer and card when a new alert arrives at the cap.
- No restart replay: the board lives in memory, so after a restart there is nothing to send; new alerts reach the on-duty sets of lib `online`. Holders are a `PlayerMap` (freed on drop); a character switch clears the cards with an empty snapshot. Recipients come from lib `online.onDutyFor(job)` only. On every duty change a player gets a snapshot of the new duty job's live alerts (an empty snapshot clears the cards, sent only to players who hold alerts), then each new alert as a delta; `ttl` / `age` travel with each alert so expiry and the card's clock time run on the client clock.
- Street and zone are read on the officer's client from the alert's point (the server has no street natives). The waypoint key (`police_alert_waypoint`, default J) acts on the newest live alert.
- The card copies tgiann-policealert's AlertBox (`docs/design.md`): navy, red code chip, glowing icon, red blink layer (opacity only) for `high`, a time bar that drains with a transform; at most four cards, newest on top.

## Contracts

- Export `DispatchAlert(alert)` (`AiPoliceAlertServerExports`): only ai-core's dispatch layer calls it.
- Events and the alert wire type with its parser: `resource/common/alerts.ts`; NUI messages: `resource/common/nui.ts` (`texts` once, then `add` / `remove` / `clear`).

## Entry points

- Server: `resource/server/alerts/` (`board.ts` the `AlertBoard`, `index.ts` its export and listeners); panel `server/schema.ts`.
- Client: `resource/client/alerts/` (cards, blips and sound `feed.ts`; events and the waypoint key `index.ts`).
- NUI: `web/src/App.tsx` + `Card.tsx`; `bun run webdev` shows three mock alerts (`web/src/dev/mock.ts`).

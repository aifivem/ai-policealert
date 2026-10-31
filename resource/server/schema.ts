import { BLIP_STYLE_FIELDS } from "@aicore-fivem/lib/shared";
import type { PanelSchema } from "@aicore-fivem/shared";

/** ai-policealert's panel: which jobs get alerts by default, alert and card time, sound. */
export const alertSchema: PanelSchema = {
  title: "ADMIN_TITLE",
  icon: "triangle-exclamation",
  files: {
    settings: {
      kind: "settings",
      sync: "all",
      sections: {
        jobs: {
          type: "names",
          lookup: "job",
          max: 10,
          itemMax: 32,
          pattern: "^[a-z0-9_]{2,32}$",
        },
        alertSeconds: { type: "number", min: 10, max: 600, integer: true },
        cardSeconds: { type: "number", min: 2, max: 60, integer: true },
        maxAlerts: { type: "number", min: 5, max: 100, integer: true },
        sound: { type: "bool" },
        blip: { type: "object", fields: BLIP_STYLE_FIELDS },
      },
    },
  },
  tabs: [
    {
      id: "settings",
      file: "settings",
      icon: "triangle-exclamation",
      label: "ADMIN_TAB_SETTINGS",
      desc: "ADMIN_TAB_SETTINGS_DESC",
      cards: [
        {
          icon: "triangle-exclamation",
          title: "ADMIN_C_ALERTS",
          desc: "ADMIN_C_ALERTS_DESC",
          fields: [
            {
              widget: "tags",
              lookup: "job",
              path: "jobs",
              label: "ADMIN_F_JOBS",
              hint: "ADMIN_H_JOBS",
              placeholder: "ADMIN_P_JOBS",
            },
            {
              widget: "number",
              path: "alertSeconds",
              label: "ADMIN_F_ALERT_SECONDS",
              hint: "ADMIN_H_ALERT_SECONDS",
              min: 10,
              max: 600,
              unit: "s",
            },
            {
              widget: "number",
              path: "cardSeconds",
              label: "ADMIN_F_CARD_SECONDS",
              hint: "ADMIN_H_CARD_SECONDS",
              min: 2,
              max: 60,
              unit: "s",
            },
            {
              widget: "number",
              path: "maxAlerts",
              label: "ADMIN_F_MAX_ALERTS",
              hint: "ADMIN_H_MAX_ALERTS",
              min: 5,
              max: 100,
            },
            {
              widget: "switch",
              path: "sound",
              label: "ADMIN_F_SOUND",
              hint: "ADMIN_H_SOUND",
            },
            {
              widget: "blip",
              path: "blip",
              label: "ADMIN_F_BLIP",
              hint: "ADMIN_H_BLIP",
            },
          ],
        },
      ],
    },
  ],
};

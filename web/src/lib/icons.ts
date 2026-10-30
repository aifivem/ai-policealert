import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBuildingColumns,
  faCannabis,
  faCar,
  faCircleInfo,
  faFlask,
  faGem,
  faGun,
  faHouse,
  faPersonRunning,
  faSackDollar,
  faShop,
  faTriangleExclamation,
  faTruck,
  faVault,
} from "@fortawesome/free-solid-svg-icons";

/** Alert icon names scripts may send (Font Awesome solid, without `fa-`); a name missing here shows the warning sign. */
const ICONS: Record<string, IconDefinition> = {
  "building-columns": faBuildingColumns,
  cannabis: faCannabis,
  car: faCar,
  "circle-info": faCircleInfo,
  flask: faFlask,
  gem: faGem,
  gun: faGun,
  house: faHouse,
  "person-running": faPersonRunning,
  "sack-dollar": faSackDollar,
  shop: faShop,
  "triangle-exclamation": faTriangleExclamation,
  truck: faTruck,
  vault: faVault,
};

export const iconOf = (name: string): IconDefinition =>
  ICONS[name] ?? faTriangleExclamation;

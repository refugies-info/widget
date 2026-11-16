import arrowDown from "@gouvfr/dsfr/dist/icons/arrows/arrow-down-s-line.svg";
import arrowLeft from "@gouvfr/dsfr/dist/icons/arrows/arrow-left-s-line.svg";
import arrowRight from "@gouvfr/dsfr/dist/icons/arrows/arrow-right-line.svg";
import arrowRightSmall from "@gouvfr/dsfr/dist/icons/arrows/arrow-right-s-line.svg";
import building from "@gouvfr/dsfr/dist/icons/buildings/building-line.svg";
import sendPlane from "@gouvfr/dsfr/dist/icons/business/send-plane-fill.svg";
import euro from "@gouvfr/dsfr/dist/icons/finance/money-euro-circle-line.svg";
import closeCircle from "@gouvfr/dsfr/dist/icons/system/close-circle-fill.svg";
import close from "@gouvfr/dsfr/dist/icons/system/close-line.svg";
import search from "@gouvfr/dsfr/dist/icons/system/search-line.svg";
import question from "@gouvfr/dsfr/dist/icons/system/question-line.svg";
import time from "@gouvfr/dsfr/dist/icons/system/time-line.svg";

export const ICONS = {
  "arrow-down": arrowDown,
  "arrow-left": arrowLeft,
  "arrow-right": arrowRight,
  "arrow-right-small": arrowRightSmall,
  building,
  close,
  "close-circle": closeCircle,
  euro,
  question,
  search,
  "send-plane": sendPlane,
  time,
} as const;

export type IconName = keyof typeof ICONS;

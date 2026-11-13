import type { DisplayedCard } from "./api.js";
import { capitalize } from "./text.js";
import { t, translateCount, translateExact } from "./wording.js";

const INTL_UNITS: Record<string, { unit: "hour" | "day" | "week" | "month" | "year"; factor: number }> = {
  hours: { unit: "hour", factor: 1 },
  days: { unit: "day", factor: 1 },
  weeks: { unit: "week", factor: 1 },
  months: { unit: "month", factor: 1 },
  trimesters: { unit: "month", factor: 3 },
  semesters: { unit: "month", factor: 6 },
  years: { unit: "year", factor: 1 },
};

const WORDED_UNITS = { sessions: "unitSessions", "half-days": "unitHalfDays" } as const;

export const formatPrice = (price: DisplayedCard["price"], locale: string) => {
  const [min, max] = price?.values ?? [];
  if (min === undefined) return null;
  if (min === 0) return capitalize(t(locale, "cardFree"), locale);

  const euro = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });
  return max === undefined ? euro.format(min) : euro.formatRange(min, max);
};

export const formatCommitment = (commitment: DisplayedCard["commitment"], locale: string) => {
  const [min, max] = commitment?.hours ?? [];
  if (!commitment || min === undefined) return null;

  const isRange = commitment.amountDetails === "between" && max !== undefined;
  const intlUnit = INTL_UNITS[commitment.timeUnit];
  if (intlUnit) {
    const duration = new Intl.NumberFormat(locale, { style: "unit", unit: intlUnit.unit, unitDisplay: "long" });
    return isRange
      ? duration.formatRange(min * intlUnit.factor, max * intlUnit.factor)
      : duration.format(min * intlUnit.factor);
  }

  const wordedUnit = WORDED_UNITS[commitment.timeUnit as keyof typeof WORDED_UNITS];
  if (!wordedUnit) return null;
  const numbers = new Intl.NumberFormat(locale);
  return isRange
    ? `${numbers.formatRange(min, max)} ${translateCount(locale, wordedUnit, max)}`
    : `${numbers.format(min)} ${translateCount(locale, wordedUnit, min)}`;
};

export const formatUpdate = (date: string, locale: string, now = Date.now()) => {
  const deltaDays = Math.round((new Date(date).getTime() - now) / (24 * 60 * 60 * 1000));
  if (Math.abs(deltaDays) >= 365) return t(locale, "cardUpdatedOverYear");

  const since =
    Math.abs(deltaDays) < 30
      ? new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(deltaDays, "day")
      : new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(
          Math.trunc(deltaDays / 30),
          "month",
        );
  return [translateExact(locale, "cardUpdated"), since].filter(Boolean).join(" ");
};

export interface Badge {
  text: string;
  kind: "procedure" | "place";
}

export const buildBadge = (
  { typeContenu, location }: Pick<DisplayedCard, "typeContenu" | "location">,
  locale: string,
): Badge | null => {
  if (typeContenu === "demarche") {
    return { text: t(locale, "badgeProcedure"), kind: "procedure" };
  }
  if (location === "france") {
    return { text: capitalize(t(locale, "locationFrance"), locale), kind: "place" };
  }
  if (location === "online") {
    return { text: capitalize(t(locale, "locationOnline"), locale), kind: "place" };
  }
  if (!Array.isArray(location) || location[0] === undefined) return null;

  if (location.length > 1) {
    const departments = t(locale, "locationDepartments").toLocaleLowerCase(locale);
    return { text: `${location.length} ${departments}`, kind: "place" };
  }
  // "75 - Paris" is shown "Paris 75"
  const [code, name] = location[0].split(" - ");
  return { text: name ? `${name} ${code}` : location[0], kind: "place" };
};

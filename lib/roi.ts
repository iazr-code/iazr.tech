/**
 * ROI estimate for the calculator. Every number comes from the visitor's own
 * inputs plus three assumptions that are shown on screen and can be changed.
 * Nothing here is a measured result or a promise.
 */

export type Currency = "USD" | "COP";

export type RoiInputs = {
  /** WhatsApp and Instagram enquiries per day. */
  daily: number;
  /** Hours per week spent on manual, repetitive tasks. */
  hours: number;
  /** Average value of one customer (in `currency`). */
  value: number;
  currency: Currency;
  /** Assumption: share of today's enquiries lost to a slow reply (0..1). */
  lostShare: number;
  /** Assumption: share of those recovered enquiries that become customers (0..1). */
  closeShare: number;
  /** Assumption: share of the manual hours that automation takes over (0..1). */
  automationShare: number;
};

export type Track = "via01" | "via02" | "both";

export type RoiResult = {
  hoursSavedMonth: number;
  recoveredLeadsMonth: number;
  recoveredCustomersMonth: number;
  revenueMonth: number;
  revenueYear: number;
  track: Track;
  /** Cumulative recovered revenue for months 1..12 (for the chart). */
  cumulative: number[];
};

export const WEEKS_PER_MONTH = 52 / 12;
export const DAYS_PER_MONTH = 30;

export const INPUT_RANGES = {
  daily: { min: 1, max: 300, step: 1 },
  hours: { min: 1, max: 80, step: 1 },
} as const;

export const CURRENCY_RANGES: Record<Currency, { min: number; max: number; step: number; initial: number }> = {
  USD: { min: 10, max: 2000, step: 10, initial: 80 },
  COP: { min: 20000, max: 5000000, step: 10000, initial: 150000 },
};

export const DEFAULT_INPUTS: RoiInputs = {
  daily: 40,
  hours: 15,
  value: CURRENCY_RANGES.USD.initial,
  currency: "USD",
  lostShare: 0.1,
  closeShare: 0.2,
  automationShare: 0.6,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Which track fits: front-desk volume (enquiries) points to Track 01, back-office
 * load (manual hours) to Track 02, both high to both.
 */
export function recommendTrack(daily: number, hours: number): Track {
  const back = hours >= 25;
  if (back && daily >= 80) return "both";
  if (back) return "via02";
  if (daily >= 10) return "via01";
  return hours >= 10 ? "via02" : "via01";
}

export function computeRoi(raw: RoiInputs): RoiResult {
  const daily = clamp(raw.daily, 0, 10000);
  const hours = clamp(raw.hours, 0, 168);
  const value = Math.max(0, raw.value);
  const lost = clamp(raw.lostShare, 0, 1);
  const close = clamp(raw.closeShare, 0, 1);
  const auto = clamp(raw.automationShare, 0, 1);

  const hoursSavedMonth = hours * WEEKS_PER_MONTH * auto;
  const recoveredLeadsMonth = daily * DAYS_PER_MONTH * lost;
  const recoveredCustomersMonth = recoveredLeadsMonth * close;
  const revenueMonth = recoveredCustomersMonth * value;
  return {
    hoursSavedMonth,
    recoveredLeadsMonth,
    recoveredCustomersMonth,
    revenueMonth,
    revenueYear: revenueMonth * 12,
    track: recommendTrack(daily, hours),
    cumulative: Array.from({ length: 12 }, (_, i) => revenueMonth * (i + 1)),
  };
}

/** Clamps a value into a currency's slider range and step. */
export function fitValue(value: number, currency: Currency): number {
  const r = CURRENCY_RANGES[currency];
  return clamp(Math.round(value / r.step) * r.step, r.min, r.max);
}

export function formatMoney(value: number, currency: Currency, locale: "es" | "en"): string {
  return new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatNumber(value: number, locale: "es" | "en", digits = 0): string {
  return new Intl.NumberFormat(locale === "es" ? "es-CO" : "en-US", { maximumFractionDigits: digits }).format(value);
}

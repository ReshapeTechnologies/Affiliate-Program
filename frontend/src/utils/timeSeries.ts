import type { TimeSeriesData } from "../types";
import type { NormalizedEvent, PurchaseEvent } from "../types/commission";

function toDateKey(value: unknown): string | null {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : typeof value === "number"
      ? new Date(value)
      : typeof value === "string"
      ? new Date(value)
      : null;

  if (!date || isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

/**
 * Generate time series data from purchase history events
 */
export function generateTimeSeriesFromEvents(
  events: PurchaseEvent[],
  signupDates?: Array<string | Date | number | null | undefined>
): TimeSeriesData[] {
  const dateMap = new Map<
    string,
    {
      signupConversions: number;
      conversions: number;
      trialConversions: number;
      paidConversions: number;
    }
  >();

  // Process signups and group by date
  (signupDates || []).forEach((signupDate) => {
    const dateKey = toDateKey(signupDate);
    if (!dateKey) return;

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        signupConversions: 0,
        conversions: 0,
        trialConversions: 0,
        paidConversions: 0,
      });
    }

    const dayData = dateMap.get(dateKey)!;
    dayData.signupConversions++;
  });

  // Process all events and group by date
  events.forEach((event) => {
    if (event.type === "INITIAL_PURCHASE" && event.purchased_at_ms) {
      // Convert timestamp to date string (YYYY-MM-DD)
      const eventDate = new Date(event.purchased_at_ms);
      const dateKey = eventDate.toISOString().split("T")[0];

      // Initialize date entry if not exists
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          signupConversions: 0,
          conversions: 0,
          trialConversions: 0,
          paidConversions: 0,
        });
      }

      const dayData = dateMap.get(dateKey)!;
      dayData.conversions++;

      if (event.period_type === "TRIAL") {
        console.log(
          `[generateTimeSeriesFromEvents] event[{index}] counted as TRIAL`
        );
        dayData.trialConversions++;
      } else if (event.period_type === "NORMAL") {
        console.log(
          `[generateTimeSeriesFromEvents] event[{index}] counted as PAID`
        );
        dayData.paidConversions++;
      } else {
        console.log(
          `[generateTimeSeriesFromEvents] event[{index}] has UNKNOWN period_type:`,
          event.period_type
        );
      }
    } else {
      console.log(
        `[generateTimeSeriesFromEvents] event[{index}] SKIPPED - not INITIAL_PURCHASE, type was:`,
        event.type
      );
    }
  });

  // Convert map to array and sort by date
  const data: TimeSeriesData[] = Array.from(dateMap.entries())
    .map(([date, values]) => ({
      date,
      signupConversions: values.signupConversions,
      conversions: values.conversions,
      trialConversions: values.trialConversions,
      paidConversions: values.paidConversions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  console.log(
    "[generateTimeSeriesFromEvents] RESULT:",
    data.length,
    "data points"
  );
  const totals = data.reduce(
    (acc, d) => ({
      trial: acc.trial + d.trialConversions,
      paid: acc.paid + d.paidConversions,
      signup: acc.signup + d.signupConversions,
    }),
    { trial: 0, paid: 0, signup: 0 }
  );
  console.log("[generateTimeSeriesFromEvents] TOTALS:", totals);

  return data;
}

/**
 * Generate time series data for last N days, filling in missing dates with zeros
 */
export function generateTimeSeriesWithFilledDates(
  events: PurchaseEvent[],
  days: number = 30,
  signupDates?: Array<string | Date | number | null | undefined>
): TimeSeriesData[] {
  const today = new Date();
  const dateMap = new Map<
    string,
    {
      signupConversions: number;
      conversions: number;
      trialConversions: number;
      paidConversions: number;
    }
  >();

  // Initialize all dates with zeros
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    dateMap.set(dateKey, {
      signupConversions: 0,
      conversions: 0,
      trialConversions: 0,
      paidConversions: 0,
    });
  }

  // Process signups and update dates
  (signupDates || []).forEach((signupDate) => {
    const dateKey = toDateKey(signupDate);
    if (!dateKey) return;
    if (!dateMap.has(dateKey)) return;
    const dayData = dateMap.get(dateKey)!;
    dayData.signupConversions++;
  });

  // Process events and update dates
  events.forEach((event) => {
    if (event.type === "INITIAL_PURCHASE" && event.purchased_at_ms) {
      const eventDate = new Date(event.purchased_at_ms);
      const dateKey = eventDate.toISOString().split("T")[0];

      if (dateMap.has(dateKey)) {
        const dayData = dateMap.get(dateKey)!;
        dayData.conversions++;

        if (event.period_type === "TRIAL") {
          dayData.trialConversions++;
        } else if (event.period_type === "NORMAL") {
          dayData.paidConversions++;
        }
      }
    }
  });

  // Convert to array and sort
  return Array.from(dateMap.entries())
    .map(([date, values]) => ({
      date,
      signupConversions: values.signupConversions,
      conversions: values.conversions,
      trialConversions: values.trialConversions,
      paidConversions: values.paidConversions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Generate time series data with custom date range
 * @param events - Array of purchase events
 * @param startDate - Start date (YYYY-MM-DD) or Date object
 * @param endDate - End date (YYYY-MM-DD) or Date object (default: today)
 * @returns Time series data filled with zeros for dates with no events
 */
export function generateTimeSeriesWithDateRange(
  events: PurchaseEvent[],
  startDate: string | Date,
  endDate?: string | Date,
  signupDates?: Array<string | Date | number | null | undefined>
): TimeSeriesData[] {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = endDate
    ? typeof endDate === "string"
      ? new Date(endDate)
      : endDate
    : new Date();

  const dateMap = new Map<
    string,
    {
      signupConversions: number;
      conversions: number;
      trialConversions: number;
      paidConversions: number;
    }
  >();

  // Initialize all dates in range with zeros
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split("T")[0];
    dateMap.set(dateKey, {
      signupConversions: 0,
      conversions: 0,
      trialConversions: 0,
      paidConversions: 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Process signups and update dates
  (signupDates || []).forEach((signupDate) => {
    const dateKey = toDateKey(signupDate);
    if (!dateKey) return;

    if (dateMap.has(dateKey)) {
      const dayData = dateMap.get(dateKey)!;
      dayData.signupConversions++;
    }
  });

  // Process events and update dates
  events.forEach((event, index) => {
    console.log(
      `[generateTimeSeriesWithDateRange] Processing event[${index}]:`,
      {
        type: event.type,
        period_type: event.period_type,
        purchased_at_ms: event.purchased_at_ms,
      }
    );

    if (event.type === "INITIAL_PURCHASE" && event.purchased_at_ms) {
      const eventDate = new Date(event.purchased_at_ms);
      const dateKey = eventDate.toISOString().split("T")[0];

      if (dateMap.has(dateKey)) {
        const dayData = dateMap.get(dateKey)!;
        dayData.conversions++;

        if (event.period_type === "TRIAL") {
          console.log(
            `[generateTimeSeriesWithDateRange] event[${index}] counted as TRIAL`
          );
          dayData.trialConversions++;
        } else if (event.period_type === "NORMAL") {
          console.log(
            `[generateTimeSeriesWithDateRange] event[${index}] counted as PAID`
          );
          dayData.paidConversions++;
        } else {
          console.log(
            `[generateTimeSeriesWithDateRange] event[${index}] has UNKNOWN period_type:`,
            event.period_type
          );
        }
      }
    }
  });

  // Convert to array and sort
  const result = Array.from(dateMap.entries())
    .map(([date, values]) => ({
      date,
      signupConversions: values.signupConversions,
      conversions: values.conversions,
      trialConversions: values.trialConversions,
      paidConversions: values.paidConversions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totals = result.reduce(
    (acc, d) => ({
      trial: acc.trial + d.trialConversions,
      paid: acc.paid + d.paidConversions,
      signup: acc.signup + d.signupConversions,
    }),
    { trial: 0, paid: 0, signup: 0 }
  );
  console.log("[generateTimeSeriesWithDateRange] TOTALS:", totals);

  return result;
}

/**
 * Get the earliest date from an array of purchase events
 * @param events - Array of purchase events
 * @returns The earliest date as YYYY-MM-DD string, or null if no events
 */
export function getEarliestEventDate(events: PurchaseEvent[]): string | null {
  if (events.length === 0) return null;

  const timestamps = events
    .filter(
      (e): e is PurchaseEvent & { purchased_at_ms: number } =>
        e.type === "INITIAL_PURCHASE" && typeof e.purchased_at_ms === "number"
    )
    .map((e) => e.purchased_at_ms);

  if (timestamps.length === 0) return null;

  const earliestTimestamp = Math.min(...timestamps);
  const date = new Date(earliestTimestamp);
  return date.toISOString().split("T")[0];
}

/**
 * Get the earliest date from an array of signup dates
 * @param signupDates - Array of signup dates (string, Date, number, or null)
 * @returns The earliest date as YYYY-MM-DD string, or null if no valid dates
 */
export function getEarliestSignupDate(
  signupDates: Array<string | Date | number | null | undefined>
): string | null {
  const validDates = signupDates
    .map((d) => toDateKey(d))
    .filter((d): d is string => d !== null)
    .sort((a, b) => a.localeCompare(b));

  return validDates.length > 0 ? validDates[0] : null;
}

/**
 * User-like shape for extracting signup dates and events
 */
interface UserWithEvents {
  referralCreatedAt?: string | Date | number | null; // From ReferralSubSchema.createdAt - the ONLY source of signup date
  events?: Array<{
    type?: string;
    purchased_at_ms?: number;
    period_type?: string;
  } | null>;
}

/**
 * Extract signup dates from an array of users
 * ONLY uses referralCreatedAt (from ReferralSubSchema.createdAt)
 * No fallback - legacy data without referralCreatedAt will not be included in signups graph
 * @param users - Array of user objects with optional referralCreatedAt
 * @returns Array of valid signup date strings/values
 */
export function extractSignupDates(
  users: UserWithEvents[]
): Array<string | Date | number> {
  const signupDates: Array<string | Date | number> = [];
  users.forEach((user) => {
    // ONLY use referralCreatedAt - no fallback
    if (user?.referralCreatedAt) {
      signupDates.push(user.referralCreatedAt);
    } else {
    }
  });
  return signupDates;
}

/**
 * Extract INITIAL_PURCHASE events from an array of users
 * @param users - Array of user objects with optional events array
 * @returns Array of valid PurchaseEvent objects (INITIAL_PURCHASE only)
 */
export function extractPurchaseEvents(
  users: UserWithEvents[]
): PurchaseEvent[] {
  const allEvents: PurchaseEvent[] = [];

  users.forEach((user) => {
    if (user?.events && Array.isArray(user.events)) {
      user.events.forEach((event) => {
        if (
          event &&
          event.type === "INITIAL_PURCHASE" &&
          event.purchased_at_ms
        ) {
          allEvents.push(event as PurchaseEvent);
        }
      });
    }
  });

  return allEvents;
}

/**
 * Build time series data from users array (centralized helper)
 *
 * Signup dates come ONLY from referralCreatedAt (ReferralSubSchema.createdAt).
 * Legacy data without referralCreatedAt will not show signups in the graph but
 * trial/purchase conversions will still be counted from events.
 *
 * @param users - Array of user objects with events and signup dates
 * @param startDate - Optional start date override (e.g., referral code creation date)
 * @param endDate - Optional end date override (defaults to today)
 * @returns TimeSeriesData array
 */
export function buildTimeSeriesFromUsers(
  users: UserWithEvents[],
  startDate?: string | Date | null,
  endDate?: string | Date | null
): TimeSeriesData[] {
  // Only extract referralCreatedAt as signup dates (no fallback)
  const signupDates = extractSignupDates(users);
  const purchaseEvents = extractPurchaseEvents(users);

  // Determine start date: provided > earliest signup > earliest event > 30 days ago
  let startDateKey: string = "";

  // 1. Use provided start date if available
  if (startDate) {
    startDateKey = toDateKey(startDate) ?? "";
  }

  // 2. Fall back to earliest signup date (only from referralCreatedAt)
  if (!startDateKey && signupDates.length > 0) {
    startDateKey = getEarliestSignupDate(signupDates) ?? "";
  }

  // 3. Fall back to earliest purchase event date
  if (!startDateKey && purchaseEvents.length > 0) {
    startDateKey = getEarliestEventDate(purchaseEvents) ?? "";
  }

  // 4. Final fallback: 30 days ago
  if (!startDateKey) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() - 29);
    startDateKey = fallback.toISOString().split("T")[0];
  }

  const endDateKey =
    toDateKey(endDate) ?? new Date().toISOString().split("T")[0];

  return generateTimeSeriesWithDateRange(
    purchaseEvents,
    startDateKey,
    endDateKey,
    signupDates
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Dynamic Event Support with NormalizedEvent
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Time series data point with dynamic event counts
 */
export interface DynamicTimeSeriesData {
  date: string;
  signupConversions: number;
  eventCounts: Record<string, number>; // e.g. { free_trial: 2, purchase: 1, 3_meals_logged: 5 }
  // Legacy fields for backward compatibility with charts
  trialConversions: number;
  paidConversions: number;
}

/**
 * Generate time series from NormalizedEvent array with dynamic event types
 * @param events - Array of normalized events (from backend)
 * @param eventTypes - Array of event types to track (e.g., from commissionConfig)
 * @param startDate - Start date
 * @param endDate - End date
 * @param signupDates - Optional array of signup dates
 * @returns Time series data with dynamic event counts
 */
export function generateDynamicTimeSeries(
  events: NormalizedEvent[],
  eventTypes: string[],
  startDate: string | Date,
  endDate?: string | Date,
  signupDates?: Array<string | Date | number | null | undefined>
): DynamicTimeSeriesData[] {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = endDate
    ? typeof endDate === "string"
      ? new Date(endDate)
      : endDate
    : new Date();

  // Initialize date map with all event types set to 0
  const dateMap = new Map<
    string,
    {
      signupConversions: number;
      eventCounts: Record<string, number>;
    }
  >();

  const initEventCounts = (): Record<string, number> => {
    const counts: Record<string, number> = {};
    eventTypes.forEach((type) => {
      counts[type] = 0;
    });
    return counts;
  };

  // Initialize all dates in range
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split("T")[0];
    dateMap.set(dateKey, {
      signupConversions: 0,
      eventCounts: initEventCounts(),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Process signups
  (signupDates || []).forEach((signupDate) => {
    const dateKey = toDateKey(signupDate);
    if (!dateKey || !dateMap.has(dateKey)) return;
    dateMap.get(dateKey)!.signupConversions++;
  });

  // Process normalized events
  events.forEach((event) => {
    const dateKey = toDateKey(event.date);
    if (!dateKey || !dateMap.has(dateKey)) return;

    const dayData = dateMap.get(dateKey)!;
    const eventType = event.type;

    // Only count if it's in our tracked event types
    if (eventTypes.includes(eventType)) {
      dayData.eventCounts[eventType] =
        (dayData.eventCounts[eventType] || 0) + 1;
    }
  });

  // Convert to array with legacy fields for backward compatibility
  return Array.from(dateMap.entries())
    .map(([date, values]) => ({
      date,
      signupConversions: values.signupConversions,
      eventCounts: values.eventCounts,
      // Legacy fields: map common event types to old field names
      trialConversions: values.eventCounts["free_trial"] || 0,
      paidConversions: values.eventCounts["purchase"] || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get earliest date from normalized events
 */
export function getEarliestNormalizedEventDate(
  events: NormalizedEvent[]
): string | null {
  const validDates = events
    .map((e) => toDateKey(e.date))
    .filter((d): d is string => d !== null)
    .sort((a, b) => a.localeCompare(b));

  return validDates.length > 0 ? validDates[0] : null;
}

/**
 * User shape with normalized events for time series generation
 */
interface UserWithNormalizedEvents {
  referralCreatedAt?: string | Date | number | null;
  events?: NormalizedEvent[];
}

/**
 * Build dynamic time series from users with normalized events
 * @param users - Array of users with normalized events
 * @param eventTypes - Event types to track (from commissionConfig)
 * @param startDate - Optional start date override
 * @param endDate - Optional end date override
 */
export function buildDynamicTimeSeriesFromUsers(
  users: UserWithNormalizedEvents[],
  eventTypes: string[],
  startDate?: string | Date | null,
  endDate?: string | Date | null
): DynamicTimeSeriesData[] {
  // Extract signup dates (only from referralCreatedAt)
  const signupDates: Array<string | Date | number> = [];
  users.forEach((user) => {
    if (user?.referralCreatedAt) {
      signupDates.push(user.referralCreatedAt);
    }
  });

  // Flatten all events from users
  const allEvents: NormalizedEvent[] = [];
  users.forEach((user) => {
    if (user?.events && Array.isArray(user.events)) {
      allEvents.push(...user.events);
    }
  });

  // Determine start date
  let startDateKey: string = "";

  if (startDate) {
    startDateKey = toDateKey(startDate) ?? "";
  }

  if (!startDateKey && signupDates.length > 0) {
    startDateKey = getEarliestSignupDate(signupDates) ?? "";
  }

  if (!startDateKey && allEvents.length > 0) {
    startDateKey = getEarliestNormalizedEventDate(allEvents) ?? "";
  }

  if (!startDateKey) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() - 29);
    startDateKey = fallback.toISOString().split("T")[0];
  }

  const endDateKey =
    toDateKey(endDate) ?? new Date().toISOString().split("T")[0];

  return generateDynamicTimeSeries(
    allEvents,
    eventTypes,
    startDateKey,
    endDateKey,
    signupDates
  );
}

/**
 * Convert legacy PurchaseEvent array to NormalizedEvent array
 * Useful for migrating existing code that still uses PurchaseEvent
 */
export function convertToNormalizedEvents(
  events: PurchaseEvent[]
): NormalizedEvent[] {
  return events
    .filter((e) => e.type === "INITIAL_PURCHASE" && e.purchased_at_ms)
    .map((event) => {
      // Map TRIAL -> free_trial, NORMAL -> purchase
      const type = event.period_type === "TRIAL" ? "free_trial" : "purchase";
      return {
        type,
        source: "purchase" as const,
        date: new Date(event.purchased_at_ms!).toISOString(),
        raw: event,
      };
    });
}

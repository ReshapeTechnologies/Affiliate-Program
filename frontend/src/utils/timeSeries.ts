import type { TimeSeriesData } from "../types";

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

interface UserWithEvents {
  referralCreatedAt?: string | Date | number | null;
  events?: any[];
}

/**
 * Build time series data from users array
 * Supports both legacy INITIAL_PURCHASE events and dynamic events.
 */
export function buildTimeSeriesFromUsers(
  users: UserWithEvents[],
  startDate?: string | Date | null,
  endDate?: string | Date | null
): TimeSeriesData[] {
  const dateMap = new Map<string, TimeSeriesData>();

  // Determine date range
  let start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : new Date();
  
  // If no start date, default to 30 days ago
  if (!start) {
      const today = new Date();
      start = new Date(today.setDate(today.getDate() - 30));
  }

  // Initialize date map with zeros for the range
  if (start && !isNaN(start.getTime())) {
    const current = new Date(start);
    while (current <= end) {
      const d = toDateKey(current);
      if (d) {
        dateMap.set(d, { date: d, eventCounts: {} });
      }
      current.setDate(current.getDate() + 1);
    }
  }

  // 1. Process Signups - add as signup event
  users.forEach((user) => {
    const d = toDateKey(user.referralCreatedAt);
    if (d) {
      if (!dateMap.has(d)) {
         dateMap.set(d, { date: d, eventCounts: {} });
      }
      const node = dateMap.get(d)!;
      node.eventCounts.signup = (node.eventCounts.signup || 0) + 1;
    }
  });

  // 2. Process Events
  users.forEach((user) => {
    if (!user.events || !Array.isArray(user.events)) return;

    user.events.forEach((event) => {
      let eventType = event.type;
      let dateVal = event.date || event.purchased_at_ms || event.createdAt;

      // Handle Legacy INITIAL_PURCHASE structure
      if (event.type === "INITIAL_PURCHASE") {
        if (event.period_type === "TRIAL") eventType = "free_trial";
        else if (event.period_type === "NORMAL") eventType = "purchase";
        else eventType = "purchase"; 
        
        dateVal = event.purchased_at_ms;
      }

      const d = toDateKey(dateVal);
      if (d && eventType) { 
         if (!dateMap.has(d)) {
            dateMap.set(d, { date: d, eventCounts: {} });
         }
         const node = dateMap.get(d)!;
         node.eventCounts[eventType] = (node.eventCounts[eventType] || 0) + 1;
      }
    });
  });
  
  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * Get the earliest date from an array of events
 * Supports legacy PurchaseEvent (purchased_at_ms) and generalized events (date/createdAt)
 */
export function getEarliestEventDate(events: any[]): string | null {
  if (!events || events.length === 0) return null;

  let earliest: number | null = null;

  events.forEach((e) => {
    // Try to find a valid timestamp
    const val = e.purchased_at_ms || e.date || e.createdAt;
    const d = new Date(val);
    
    if (!isNaN(d.getTime())) {
      const ts = d.getTime();
      if (earliest === null || ts < earliest) {
        earliest = ts;
      }
    }
  });

  if (earliest === null) return null;
  return new Date(earliest).toISOString().split("T")[0];
}

import type {
  PurchaseEvent,
  PurchaseHistoryRecord,
} from "../types/purchaseHistory";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPurchaseEventLike(value: unknown): value is PurchaseEvent {
  if (!isRecord(value)) return false;

  return (
    typeof value.event_timestamp_ms === "number" &&
    typeof value.product_id === "string" &&
    typeof value.period_type === "string" &&
    typeof value.purchased_at_ms === "number" &&
    typeof value.expiration_at_ms === "number" &&
    typeof value.environment === "string" &&
    typeof value.transaction_id === "string" &&
    typeof value.original_transaction_id === "string" &&
    typeof value.country_code === "string" &&
    typeof value.app_user_id === "string" &&
    typeof value.currency === "string" &&
    typeof value.price === "number" &&
    typeof value.price_in_purchased_currency === "number" &&
    typeof value.store === "string" &&
    typeof value.takehome_percentage === "number" &&
    typeof value.tax_percentage === "number" &&
    typeof value.commission_percentage === "number" &&
    typeof value.type === "string" &&
    typeof value.id === "string" &&
    typeof value.app_id === "string"
  );
}

/**
 * Parse purchase history event string to array
 */
export function parsePurchaseEvents(
  record: PurchaseHistoryRecord
): PurchaseEvent[] {
  if (Array.isArray(record.event)) {
    return record.event.filter(isPurchaseEventLike);
  }

  if (typeof record.event === "string") {
    try {
      const parsed: unknown = JSON.parse(record.event);
      if (Array.isArray(parsed)) {
        return parsed.filter(isPurchaseEventLike);
      }
      return isPurchaseEventLike(parsed) ? [parsed] : [];
    } catch (error) {
      console.error("Error parsing purchase events:", error);
      return [];
    }
  }

  return [];
}

/**
 * Calculate revenue from purchase events
 */
export function calculateRevenueFromEvents(events: PurchaseEvent[]): number {
  return events.reduce((total, event) => {
    // Only count INITIAL_PURCHASE with NORMAL period_type as revenue
    // TRIAL purchases have price 0, so we can include all INITIAL_PURCHASE
    if (event.type === "INITIAL_PURCHASE") {
      return total + (event.price || 0);
    }
    return total;
  }, 0);
}

/**
 * Count conversions from purchase events
 */
export function countConversionsFromEvents(events: PurchaseEvent[]): {
  trial: number;
  paid: number;
} {
  const conversions = {
    trial: 0,
    paid: 0,
  };

  events.forEach((event) => {
    if (event.type === "INITIAL_PURCHASE") {
      if (event.period_type === "TRIAL") {
        conversions.trial++;
      } else if (event.period_type === "NORMAL") {
        conversions.paid++;
      }
    }
  });

  return conversions;
}

/**
 * Get events by date range
 */
export function getEventsByDateRange(
  events: PurchaseEvent[],
  startDate: Date,
  endDate: Date
): PurchaseEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.purchased_at_ms);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

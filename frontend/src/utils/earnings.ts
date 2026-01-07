import type { CommissionRule, EarningsBreakdown } from "../types/commission";

/**
 * Calculate earnings for a referral code based on dynamic rules
 */
export function calculateEarnings(
  stats: Record<string, number>,
  rules: CommissionRule[]
): EarningsBreakdown {
  let total = 0;
  const breakdown: Record<string, number> = {};
  // Default currency to the first rule's currency or USD if no rules
  let currency = rules.length > 0 ? rules[0].currency : "USD";

  for (const rule of rules) {
    const count = stats[rule.event] || 0;
    const earnings = count * rule.rate;
    breakdown[rule.event] = Number(earnings.toFixed(2));
    total += earnings;
    // Update currency to ensure it matches the rule (assuming single currency per code)
    if (rule.currency) currency = rule.currency;
  }

  return {
    breakdown,
    total: Number(total.toFixed(2)),
    currency,
  };
}

/**
 * Calculate total earnings from multiple referral codes
 */
export function calculateTotalEarnings(
  codesResults: Array<{
    stats: Record<string, number>;
    rules: CommissionRule[];
  }>
): EarningsBreakdown {
  // This is tricky if codes have different currencies.
  // For now assuming same currency or just summing numbers (naive).

  const aggregateBreakdown: Record<string, number> = {};
  let globalTotal = 0;
  let globalCurrency = "USD";

  for (const item of codesResults) {
    const result = calculateEarnings(item.stats, item.rules);
    globalTotal += result.total;
    globalCurrency = result.currency;

    for (const [event, amount] of Object.entries(result.breakdown)) {
      aggregateBreakdown[event] = (aggregateBreakdown[event] || 0) + amount;
    }
  }

  return {
    breakdown: aggregateBreakdown,
    total: Number(globalTotal.toFixed(2)),
    currency: globalCurrency,
  };
}

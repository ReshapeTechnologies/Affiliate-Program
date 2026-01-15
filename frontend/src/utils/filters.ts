// Filter and Sort Utilities

export type SortDirection = "asc" | "desc";

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

/**
 * Generic filter function
 */
export function filterItems<T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items;

  const lowerSearch = searchTerm.toLowerCase();
  return items.filter((item) =>
    searchKeys.some((key) => {
      const value = item[key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowerSearch);
    })
  );
}

/**
 * Generic sort function with support for computed fields
 */
export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortConfig: SortConfig<T> | null
): T[] {
  if (!sortConfig) return items;

  return [...items].sort((a, b) => {
    let aValue: any = a[sortConfig.key];
    let bValue: any = b[sortConfig.key];

    // Handle special computed fields for ReferralCode
    if (
      (sortConfig.key as string) === "signups" &&
      "eventStats" in a &&
      "eventStats" in b
    ) {
      aValue = (a as any).eventStats?.signup ?? 0;
      bValue = (b as any).eventStats?.signup ?? 0;
    } else if (
      (sortConfig.key as string) === "totalConversions" &&
      "eventStats" in a &&
      "eventStats" in b
    ) {
      aValue = (Object.values((a as any).eventStats || {}) as number[]).reduce(
        (sum, count) => sum + count,
        0
      );
      bValue = (Object.values((b as any).eventStats || {}) as number[]).reduce(
        (sum, count) => sum + count,
        0
      );
    }
    // Handle nested objects (e.g., earnings.total)
    else if (
      typeof aValue === "object" &&
      aValue !== null &&
      "total" in aValue
    ) {
      aValue = (aValue as any).total;
    }
    if (typeof bValue === "object" && bValue !== null && "total" in bValue) {
      bValue = (bValue as any).total;
    }

    // Handle null/undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Compare values
    let comparison = 0;
    if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortConfig.direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Toggle sort direction
 */
export function toggleSortDirection(current: SortDirection): SortDirection {
  return current === "asc" ? "desc" : "asc";
}

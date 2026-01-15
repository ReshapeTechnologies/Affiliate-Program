import { useState, useMemo } from "react";
import type { SortConfig } from "../utils/filters";
import { filterItems, sortItems } from "../utils/filters";

interface UseFiltersOptions<T extends Record<string, any>> {
  searchKeys?: (keyof T)[];
}

export function useFilters<T extends Record<string, any>>(
  items: T[],
  options: UseFiltersOptions<T> = {}
) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...items];

    // Apply search filter
    if (searchTerm && options.searchKeys) {
      result = filterItems(result, searchTerm, options.searchKeys);
    }

    // Apply sorting
    if (sortConfig) {
      result = sortItems(result, sortConfig);
    }

    return result;
  }, [items, searchTerm, sortConfig, options.searchKeys]);

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortConfig(null);
  };

  return {
    filteredItems: filteredAndSorted,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    clearFilters,
    hasActiveFilters: !!(searchTerm || sortConfig),
  };
}

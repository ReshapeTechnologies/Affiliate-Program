interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  usageFilter?: "all" | "used" | "unused";
  onUsageFilterChange?: (value: "all" | "used" | "unused") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function TableFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  usageFilter,
  onUsageFilterChange,
  onClearFilters,
  hasActiveFilters,
}: TableFiltersProps) {
  return (
    <div className="table-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search referral codes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="filter-group">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="exhausted">Exhausted</option>
        </select>
      </div>
      {usageFilter && onUsageFilterChange && (
        <div className="filter-group">
          <select
            value={usageFilter}
            onChange={(e) =>
              onUsageFilterChange(e.target.value as "all" | "used" | "unused")
            }
            className="filter-select"
          >
            <option value="all">All Codes</option>
            <option value="used">Used (has signups)</option>
            <option value="unused">Unused (no signups)</option>
          </select>
        </div>
      )}
      {hasActiveFilters && (
        <button onClick={onClearFilters} className="clear-filters-button">
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default function FilterBar({ filters, filterOptions, updateFilter, clearFilters, activeFilterCount }) {
  return (
    <div className="filter-bar">
      <select value={filters.channel} onChange={(e) => updateFilter("channel", e.target.value)}>
        <option value="">All Channels</option>
        {filterOptions.channels.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select value={filters.city_name} onChange={(e) => updateFilter("city_name", e.target.value)}>
        <option value="">All Cities</option>
        {filterOptions.cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select value={filters.wh_name} onChange={(e) => updateFilter("wh_name", e.target.value)}>
        <option value="">All Warehouses</option>
        {filterOptions.warehouses.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>

      {activeFilterCount > 0 && (
        <button className="nav-btn" onClick={clearFilters}>
          Clear filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
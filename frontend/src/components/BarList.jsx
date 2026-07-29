export default function BarList({ items, icon = "🏢" }) {
  return (
    <div className="bar-list">
      {items.map(({ label, count, percent }) => (
        <div className="bar-row" key={label}>
          <div className="bar-label">
            <span className="bar-label-text">
              <span className="bar-icon">{icon}</span>
              {label}
            </span>
            <span>{count} trips{percent !== undefined ? ` (${percent}%)` : ""}</span>
          </div>
          <div className="bar-track pill">
            <div className="bar-fill pill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
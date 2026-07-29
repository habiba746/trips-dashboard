const ICONS = {
  "Total Trips": "🚚",
  "Total Orders": "📦",
  "Total Quantity": "⚖️",
};

export default function SummaryCards({ summary }) {
  const items = [
    { label: "Total Trips", value: summary.total_trips },
    { label: "Total Orders", value: summary.total_orders },
    { label: "Total Quantity", value: `${summary.total_quantity.toFixed(2)} KG` },
  ];

  return (
    <div className="summary-grid">
      {items.map((item) => (
        <div className="card" key={item.label}>
          <div className="card-header">
            <span className="card-icon">{ICONS[item.label]}</span>
            <h3>{item.label}</h3>
          </div>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
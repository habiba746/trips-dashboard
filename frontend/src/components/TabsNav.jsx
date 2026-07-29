const TABS = [
  { key: "trips", label: "Trips" },
  { key: "orders", label: "Orders" },
  { key: "channels", label: "Channels" },
  { key: "vehicles", label: "Vehicles" },
  { key: "warehouses", label: "Warehouses" },
];

export default function TabsNav({ activeTab, setActiveTab }) {
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? "tab active" : "tab"}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
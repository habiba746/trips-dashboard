import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";
const EDITABLE_FIELDS = ["quantity", "channel", "city_name", "wh_name"];

const COLUMNS = [
  { key: "requestId", label: "Request ID" },
  { key: "tripId", label: "Trip ID" },
  { key: "channel", label: "Channel" },
  { key: "quantity", label: "Quantity" },
  { key: "city_name", label: "City" },
  { key: "wh_name", label: "Warehouse" },
];

export default function TripsTable({ trips, onTripUpdated }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [editingCell, setEditingCell] = useState(null); // `${requestId}-${field}`
  const [editValue, setEditValue] = useState("");
  const [savingCell, setSavingCell] = useState(null);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedTrips = [...trips].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortDir === "asc" ? valA - valB : valB - valA;
    }
    return sortDir === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  function startEdit(row, field) {
    if (!EDITABLE_FIELDS.includes(field)) return;
    setEditingCell(`${row.requestId}-${field}`);
    setEditValue(row[field]);
  }

  async function saveEdit(row, field) {
    const cellKey = `${row.requestId}-${field}`;
    if (editValue === row[field]) {
      setEditingCell(null);
      return;
    }
    setSavingCell(cellKey);
    try {
      await axios.put(`${API_BASE}/api/trips/${row.requestId}`, {
        [field]: field === "quantity" ? Number(editValue) : editValue,
      });
      if (onTripUpdated) onTripUpdated();
    } catch (err) {
      console.error("Failed to save edit:", err);
      alert("Failed to save — see console for details.");
    } finally {
      setSavingCell(null);
      setEditingCell(null);
    }
  }

  function handleKeyDown(e, row, field) {
    if (e.key === "Enter") saveEdit(row, field);
    if (e.key === "Escape") setEditingCell(null);
  }

  return (
    <table className="trips-table">
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-th">
              {col.label}
              {sortKey === col.key && <span className="sort-arrow">{sortDir === "asc" ? " ▲" : " ▼"}</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedTrips.slice(0, 100).map((row) => (
          <tr key={row.requestId}>
            {COLUMNS.map((col) => {
              const cellKey = `${row.requestId}-${col.key}`;
              const isEditable = EDITABLE_FIELDS.includes(col.key);
              const isEditing = editingCell === cellKey;
              const isSaving = savingCell === cellKey;

              return (
                <td
                  key={col.key}
                  className={isEditable ? "editable-cell" : ""}
                  onClick={() => !isEditing && startEdit(row, col.key)}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      className="cell-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(row, col.key)}
                      onKeyDown={(e) => handleKeyDown(e, row, col.key)}
                    />
                  ) : isSaving ? (
                    "Saving..."
                  ) : (
                    row[col.key]
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import "./App.css";

import { getWeekDays, getMonthGrid, formatDate } from "./utils/dateHelpers";
import Header from "./components/Header";
import CalendarDropdown from "./components/CalendarDropdown";
import FilterBar from "./components/FilterBar";
import SummaryCards from "./components/SummaryCards";
import TabsNav from "./components/TabsNav";
import TripsTable from "./components/TripsTable";
import BarList from "./components/BarList";
import ChannelBreakdown from "./components/ChannelBreakdown";

const API_BASE = "http://localhost:8000";
const DATA_START = new Date("2026-05-01");
const DATA_END = new Date("2026-06-30");

function App() {
  const [viewMode, setViewMode] = useState("week");
  const [selectedDate, setSelectedDate] = useState(new Date("2026-06-15"));
  const [summary, setSummary] = useState(null);
  const [trips, setTrips] = useState([]);
  const [dailyCounts, setDailyCounts] = useState({});
  const [filterOptions, setFilterOptions] = useState({ channels: [], cities: [], warehouses: [] });
  const [filters, setFilters] = useState({ channel: "", city_name: "", wh_name: "" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trips");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const calendarRef = useRef(null);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const monthDays = useMemo(() => getMonthGrid(selectedDate), [selectedDate]);
  const visibleDays = viewMode === "week" ? weekDays : monthDays;
  const dateStr = formatDate(selectedDate);

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/api/filter-options`).then((res) => setFilterOptions(res.data));
  }, []);

  useEffect(() => {
    const rangeStart = formatDate(visibleDays[0]);
    const rangeEnd = formatDate(visibleDays[visibleDays.length - 1]);
    axios
      .get(`${API_BASE}/api/daily-counts`, { params: { start_date: rangeStart, end_date: rangeEnd } })
      .then((res) => setDailyCounts(res.data));
  }, [viewMode, dateStr]);

  async function refetchData() {
    setLoading(true);
    const params = { start_date: dateStr, end_date: dateStr, ...filters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);

    try {
      const summaryRes = await axios.get(`${API_BASE}/api/summary`, { params });
      const tripsRes = await axios.get(`${API_BASE}/api/trips`, { params });
      setSummary(summaryRes.data);
      setTrips(tripsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetchData();
  }, [dateStr, filters]);

  function goToPrev() {
    const d = new Date(selectedDate);
    if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setSelectedDate(d);
  }

  function goToNext() {
    const d = new Date(selectedDate);
    if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setSelectedDate(d);
  }

  function goToDataStart() {
    setSelectedDate(new Date(DATA_START));
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters({ channel: "", city_name: "", wh_name: "" });
  }

  function pickDay(d) {
    setSelectedDate(d);
    setCalendarOpen(false);
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const headerLabel = viewMode === "week"
    ? weekDays[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const buttonLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const vehicleItems = summary
    ? Object.entries(summary.vehicle_types).map(([label, count]) => {
        const max = Math.max(...Object.values(summary.vehicle_types));
        return { label, count, percent: Math.round((count / max) * 100) };
      })
    : [];

  const warehouseItems = summary
    ? Object.entries(summary.warehouse_performance).map(([label, data]) => ({
        label,
        count: data.trips,
        percent: data.percent,
      }))
    : [];

    
  return (
    <div className="page">
      <Header />

      <div className="dashboard-layout">
        <aside className="sidebar">
          <CalendarDropdown
            calendarRef={calendarRef}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedDate={selectedDate}
            weekDays={weekDays}
            monthDays={monthDays}
            dailyCounts={dailyCounts}
            dataStart={DATA_START}
            dataEnd={DATA_END}
            goToPrev={goToPrev}
            goToNext={goToNext}
            goToDataStart={goToDataStart}
            pickDay={pickDay}
            headerLabel={headerLabel}
            buttonLabel={buttonLabel}
          />

          <FilterBar
            filters={filters}
            filterOptions={filterOptions}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
          />

          {summary && <SummaryCards summary={summary} />}
        </aside>

        <main className="main-content">
          {loading || !summary ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

              {activeTab === "trips" && <TripsTable trips={trips} onTripUpdated={refetchData} />}

              {activeTab === "orders" && (
                <div className="card">
                  <h3>Total Orders</h3>
                  <p>{summary.total_orders}</p>
                  <p className="muted">Unique requestId count for {dateStr}</p>
                </div>
              )}

              {activeTab === "channels" && <ChannelBreakdown channels={summary.channels} />}

              {activeTab === "vehicles" && <BarList items={vehicleItems} icon="🚚" />}
              {activeTab === "warehouses" && <BarList items={warehouseItems} icon="🏢" />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
import { formatDate } from "../utils/dateHelpers";

export default function CalendarDropdown({
  calendarRef,
  calendarOpen,
  setCalendarOpen,
  viewMode,
  setViewMode,
  selectedDate,
  weekDays,
  monthDays,
  dailyCounts,
  dataStart,
  dataEnd,
  goToPrev,
  goToNext,
  goToDataStart,
  pickDay,
  headerLabel,
  buttonLabel,
}) {
  const dateStr = formatDate(selectedDate);

  return (
    <div className="calendar-trigger-wrap" ref={calendarRef}>
      <button className="calendar-trigger" onClick={() => setCalendarOpen((v) => !v)}>
        <span>📅 {buttonLabel}</span>
        <span className="chevron">{calendarOpen ? "▲" : "▼"}</span>
      </button>

      {calendarOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button className="nav-btn" onClick={goToDataStart}>Jump to Data</button>
            <div className="week-nav">
              <button className="nav-btn" onClick={goToPrev}>‹</button>
              <span className="week-label">{headerLabel}</span>
              <button className="nav-btn" onClick={goToNext}>›</button>
            </div>
            <div className="view-toggle">
              <button
                className={viewMode === "week" ? "toggle-btn active" : "toggle-btn"}
                onClick={() => setViewMode("week")}
              >
                Week
              </button>
              <button
                className={viewMode === "month" ? "toggle-btn active" : "toggle-btn"}
                onClick={() => setViewMode("month")}
              >
                Month
              </button>
            </div>
          </div>

          {viewMode === "week" ? (
            <div className="calendar-strip">
              {weekDays.map((d) => {
                const isSelected = formatDate(d) === dateStr;
                const inRange = d >= dataStart && d <= dataEnd;
                const count = dailyCounts[formatDate(d)] || 0;
                return (
                  <div
                    key={d.toISOString()}
                    className={`day-card ${isSelected ? "selected" : ""} ${!inRange ? "out-of-range" : ""}`}
                    onClick={() => pickDay(d)}
                  >
                    <div className="day-name">
                      {d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                    </div>
                    <div className="day-number">{d.getDate()}</div>
                    <div className="day-trips">{count} trips</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="month-grid">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((label) => (
                <div key={label} className="month-weekday-label">{label}</div>
              ))}
              {monthDays.map((d) => {
                const isSelected = formatDate(d) === dateStr;
                const inRange = d >= dataStart && d <= dataEnd;
                const inCurrentMonth = d.getMonth() === selectedDate.getMonth();
                const count = dailyCounts[formatDate(d)] || 0;
                return (
                  <div
                    key={d.toISOString()}
                    className={`month-cell ${isSelected ? "selected" : ""} ${!inRange ? "out-of-range" : ""} ${!inCurrentMonth ? "dimmed" : ""}`}
                    onClick={() => pickDay(d)}
                  >
                    <div className="month-cell-number">{d.getDate()}</div>
                    {inCurrentMonth && count > 0 && <div className="month-cell-trips">{count}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
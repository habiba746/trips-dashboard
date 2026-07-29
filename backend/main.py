from typing import Optional
from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI() #creates the web server application.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCEL_PATH = "trips.xlsx"

#Data loading & caching
def _read_excel():
    df = pd.read_excel(EXCEL_PATH)
    df["collection_date"] = pd.to_datetime(df["collection_date"])
    return df

#read once stored in memorey
_cached_df = _read_excel()


def load_data():
    return _cached_df.copy()

#Re-reads the Excel file from disk into the cache 
@app.post("/api/refresh-data")
def refresh_data():
    global _cached_df
    _cached_df = _read_excel()
    return {"status": "reloaded", "rows": len(_cached_df)}

#Returns individual trip rows, optionally filtered by date/channel/city/warehouse
@app.get("/api/trips")
def get_trips(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    wh_name: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    city_name: Optional[str] = Query(None),
):
    df = load_data()

    if start_date:
        df = df[df["collection_date"] >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df["collection_date"] <= pd.to_datetime(end_date)]
    if wh_name:
        df = df[df["wh_name"] == wh_name]
    if channel:
        df = df[df["channel"] == channel]
    if city_name:
        df = df[df["city_name"] == city_name]

    return df.to_dict(orient="records")

#Returns aggregated numbers: total trips, total orders, total quantity
def get_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    wh_name: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    city_name: Optional[str] = Query(None),
):
    df = load_data()
    if start_date:
        df = df[df["collection_date"] >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df["collection_date"] <= pd.to_datetime(end_date)]
    if wh_name:
        df = df[df["wh_name"] == wh_name]
    if channel:
        df = df[df["channel"] == channel]
    if city_name:
        df = df[df["city_name"] == city_name]

    vehicle_counts = df.groupby("vehicle")["tripId"].nunique().to_dict()

    wh_trip_counts = df.groupby("wh_name")["tripId"].nunique()
    total_trips_for_wh = int(wh_trip_counts.sum()) or 1
    warehouse_performance = {
        wh: {
            "trips": int(count),
            "percent": round((count / total_trips_for_wh) * 100, 1),
        }
        for wh, count in wh_trip_counts.items()
    }

    return {
        "total_trips": int(df["tripId"].nunique()),
        "total_orders": int(df["requestId"].nunique()),
        "total_quantity": float(df["quantity"].sum()),
        "channels": df["channel"].value_counts().to_dict(),
        "vehicle_types": vehicle_counts,
        "warehouse_performance": warehouse_performance,
    }

#Returns {date} for a date range — powers the numbers shown under each calendar day
@app.get("/api/daily-counts")
def get_daily_counts(start_date: str, end_date: str):
    df = load_data()
    df = df[
        (df["collection_date"] >= pd.to_datetime(start_date))
        & (df["collection_date"] <= pd.to_datetime(end_date))
    ]
    counts = df.groupby(df["collection_date"].dt.date)["tripId"].nunique()
    return {str(day): int(count) for day, count in counts.items()}

#Returns the distinct list of channels/cities/warehouses, used to populate the filter dropdowns
@app.get("/api/filter-options")
def get_filter_options():
    df = load_data()
    return {
        "channels": sorted(df["channel"].dropna().unique().tolist()),
        "cities": sorted(df["city_name"].dropna().unique().tolist()),
        "warehouses": sorted(df["wh_name"].dropna().unique().tolist()),
    }

from fastapi import Body


@app.put("/api/trips/{request_id}")
def update_trip(request_id: int, updates: dict = Body(...)):
    global _cached_df
    mask = _cached_df["requestId"] == request_id

    if not mask.any():
        return {"status": "error", "message": "requestId not found"}

    editable_fields = {"quantity", "channel", "city_name", "wh_name"}
    for key, value in updates.items():
        if key in editable_fields:
            _cached_df.loc[mask, key] = value

    # Persist the change back to the Excel file so it survives a restart
    _cached_df.to_excel(EXCEL_PATH, index=False)

    return {"status": "updated"}
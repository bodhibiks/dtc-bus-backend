import express from "express";
import fetch from "node-fetch";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "S7BjFT1yXFCDCiR62hCxxpmI3igE9XO2";
const VEHICLE_FEED = `https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?api_key=${API_KEY}`;

app.get("/", async (req, res) => {
  try {
    const response = await fetch(VEHICLE_FEED);
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    const routeId = "548CLUP";

    const vehicles = feed.entity
      .filter(e => e.vehicle && e.vehicle.trip && e.vehicle.trip.routeId === routeId)
      .map(e => e.vehicle);

    if (vehicles.length === 0) {
      return res.json({ error: "No live buses found on this route right now." });
    }

    const bus = vehicles[0];

    res.json({
      route: routeId,
      vehicle_id: bus.vehicle?.id || "unknown",
      latitude: bus.position.latitude,
      longitude: bus.position.longitude,
      timestamp: bus.timestamp
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

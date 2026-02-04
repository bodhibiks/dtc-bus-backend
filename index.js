import express from "express";
import fetch from "node-fetch";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "S7BjFT1yXFCDCiR62hCxxpmI3igE9XO2";
const FEED_URL = `https://otd.delhi.gov.in/api/realtime/TripUpdates.pb?api_key=${API_KEY}`;

app.get("/", async (req, res) => {
  try {
    const response = await fetch(FEED_URL);
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));

    // Filter for route 548CLUP
    const routeId = "548CLUP";

    const trips = feed.entity
      .filter(e => e.tripUpdate && e.tripUpdate.trip.routeId === routeId)
      .map(e => e.tripUpdate);

    if (trips.length === 0) {
      return res.json({ error: "No live data for this route right now." });
    }

    const trip = trips[0];

    const stopTimes = trip.stopTimeUpdate.map(stu => ({
      stop_id: stu.stopId,
      arrival_time: stu.arrival?.time ? new Date(stu.arrival.time * 1000).toLocaleTimeString() : null
    }));

    res.json({
      route: routeId,
      stops: stopTimes
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

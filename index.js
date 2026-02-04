import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// Your route
const ROUTE_ID = "548CLUP";
const URL = `https://businfo.dimts.in/businfo/Bus_info/EtaByRoute.aspx?ID=${ROUTE_ID}`;

app.get("/", async (req, res) => {
  try {
    const response = await fetch(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    let results = [];

    // Try to extract stop names and times from table rows
    $("tr").each((i, el) => {
      const tds = $(el).find("td");
      if (tds.length >= 2) {
        const stop = $(tds[0]).text().trim();
        const time = $(tds[1]).text().trim();
        if (stop && time) {
          results.push({ stop, time });
        }
      }
    });

    if (results.length === 0) {
      return res.json({ error: "No ETA data found. Page structure may have changed." });
    }

    res.json({
      route: ROUTE_ID,
      eta: results
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

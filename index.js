const express = require("express");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/api/flights", async (req, res) => {
    try {
        const API_KEY = process.env.API_KEY;
        const url = `https://api.aviationstack.com/v1/flights?access_key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();
        res.json(data); // Send to frontend
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch flight data" });
    }
});


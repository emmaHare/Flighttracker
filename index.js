const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/api", async (req, res) => {
    const searchTerm = req.query.q || "harry potter"; // default if none provided

    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch book data" });
    }
});


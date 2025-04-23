const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/api", async (req, res) => {
    const { title, author, subject, publish_year, q } = req.query;
  
    let url = "";
    let isSubjectSearch = false;
  
    if (title) {
      url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`;
    } else if (author) {
      url = `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}`;
    } else if (publish_year) {
      url = `https://openlibrary.org/search.json?q=${encodeURIComponent(publish_year)}`;
    } else if (subject) {
      isSubjectSearch = true;
      url = `https://openlibrary.org/subjects/${encodeURIComponent(subject.toLowerCase())}.json`;
    } else {
      url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q || "harry potter")}`;
    }
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (isSubjectSearch) {
        const docs = (data.works || []).map(work => ({
          title: work.title,
          author_name: (work.authors || []).map(a => a.name),
          first_publish_year: work.first_publish_year || null,
          cover_i: work.cover_id || null,
          subject: work.subject || []  // ← use actual subjects here
        }));
      
        res.json({ docs });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Failed to fetch book data" });
    }
  });

let currentFilter = null;

function setFilter(filterType) {
  const activeBtn = document.getElementById(`filter-${filterType}`);
  const isActive = activeBtn.classList.contains("active");

  // If already active, deactivate and reset
  if (isActive) {
    activeBtn.classList.remove("active");
    currentFilter = null;
    document.getElementById("search-box").placeholder = "Search for books...";
    getBook();
    return;
  }

  // Otherwise, activate new filter
  currentFilter = filterType;

  // Remove active class from all
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.classList.remove("active")
  );

  // Add to clicked
  activeBtn.classList.add("active");

  // Update placeholder
  const placeholderMap = {
    title: "Search for book titles...",
    author: "Search for authors...",
    year: "Search by publish year..."
  };
  document.getElementById("search-box").placeholder = placeholderMap[filterType] || "Search for books...";

  // Trigger fetch if input exists
  const input = document.getElementById("search-box").value.trim();
  if (input) {
    getBook(input);
  }
}

function getBook(searchTerm = "harry potter") {
  const term = searchTerm.trim().toLowerCase();
  fetch(`/api?${currentFilter}=${encodeURIComponent(searchTerm)}`)
    .then(response => response.json())
    .then(data => {
      const output = document.getElementById("book-output");
      output.innerHTML = "";

      const books = data.docs || [];

      // filter results based on prefix
      const filteredBooks = books.filter(book => {
        if (currentFilter === "title") {
          return (book.title || "").toLowerCase().startsWith(term);
        }
        if (currentFilter === "author") {
          return (book.author_name || []).some(author =>
            author.toLowerCase().startsWith(term)
          );
        }
        if (currentFilter === "year") {
          const year = book.first_publish_year?.toString() || "";
          return year.startsWith(term);
        }
        return true;
      });

      if (filteredBooks.length === 0) {
        output.textContent = "No results found.";
        return;
      }

      filteredBooks.forEach(book => {
        const title = book.title || "No title";
        const author = book.author_name ? book.author_name.join(", ") : "Unknown author";
        const year = book.first_publish_year || "N/A";
        const coverId = book.cover_i;
        const coverUrl = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          : "";

        const bookDiv = document.createElement("div");
        bookDiv.className = "book-card";

        const textDiv = document.createElement("div");
        textDiv.className = "text-part"

        const titleEl = document.createElement("h3");
        titleEl.className = "book-title";
        titleEl.textContent = title;
        titleEl.title = title;
        textDiv.appendChild(titleEl);

        const authorEl = document.createElement("p");
        authorEl.className = "book-author";
        authorEl.innerHTML = `<strong>Author:</strong> ${author}`;
        authorEl.title = author;
        textDiv.appendChild(authorEl);

        const yearEl = document.createElement("p");
        yearEl.className = "book-year";
        yearEl.innerHTML = `<strong>First Published:</strong> ${year}`;
        textDiv.appendChild(yearEl);

        bookDiv.appendChild(textDiv);

        if (coverUrl) {
          const imgEl = document.createElement("img");
          imgEl.className = "book-cover";
          imgEl.src = coverUrl;
          imgEl.alt = `Cover of ${title}`;
          bookDiv.appendChild(imgEl);
        }
        
        output.appendChild(bookDiv);
      });
    })
    .catch(error => {
      document.getElementById("book-output").textContent = "Error fetching data.";
      console.error("Fetch error:", error);
    });
}

function searchBooks() {
  const term = document.getElementById("search-box").value.trim();
  if (term) getBook(term);
}

function autoSuggest() {
  const term = document.getElementById("search-box").value.trim().toLowerCase();
  const suggestionBox = document.getElementById("suggestions");
  suggestionBox.innerHTML = "";

  if (!term) {
    suggestionBox.style.display = "none";
    getBook(); // Reset results
    return;
  }

  fetch(`/api?${currentFilter}=${encodeURIComponent(term)}`)
    .then(res => res.json())
    .then(data => {
      const books = data.docs || [];
      const suggestions = new Set();

      books.forEach(book => {
        if (currentFilter === "title" && book.title) {
          suggestions.add(book.title);
        }
        if (currentFilter === "author" && book.author_name) {
          book.author_name.forEach(name => suggestions.add(name));
        }
        if (currentFilter === "subject" && book.subject) {
          book.subject.forEach(sub => suggestions.add(sub));
        }
        if (currentFilter === "year" && book.first_publish_year) {
          suggestions.add(book.first_publish_year.toString());
        }
      });

      const filteredSuggestions = Array.from(suggestions)
      .filter(s => s.toLowerCase().startsWith(term))
      .sort()
      .slice(0, 10); // limit to 10 // Limit to 10

      if (filteredSuggestions.length === 0) {
        suggestionBox.style.display = "none";
        return;
      }
      
      filteredSuggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion;
        li.onclick = () => {
          document.getElementById("search-box").value = suggestion;
          suggestionBox.style.display = "none";
          getBook(suggestion);
        };
        suggestionBox.appendChild(li);
      });

      suggestionBox.style.display = "block";
    })
    .catch(err => {
      console.error("Suggestion fetch error:", err);
      suggestionBox.style.display = "none";
    });
}

// Run on load
window.onload = function () {
  getBook();
};
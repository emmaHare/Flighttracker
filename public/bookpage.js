let currentFilter = "title";

function setFilter(filterType) {
  currentFilter = filterType;

  // highlight selected button
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.classList.remove("active")
  );
  document.getElementById(`filter-${filterType}`).classList.add("active");

  // trigger auto-suggestion if input has value
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
        if (currentFilter === "subject") {
          return (book.subject || []).some(subject =>
            subject.toLowerCase().startsWith(term)
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

        const titleEl = document.createElement("h3");
        titleEl.className = "book-title";
        titleEl.textContent = title;
        bookDiv.appendChild(titleEl);

        const authorEl = document.createElement("p");
        authorEl.className = "book-author";
        authorEl.innerHTML = `<strong>Author:</strong> ${author}`;
        bookDiv.appendChild(authorEl);

        const yearEl = document.createElement("p");
        yearEl.className = "book-year";
        yearEl.innerHTML = `<strong>First Published:</strong> ${year}`;
        bookDiv.appendChild(yearEl);

        
        if (book.subject && book.subject.length > 0) {
          const subjectEl = document.createElement("p");
          subjectEl.className = "book-subject";
          subjectEl.innerHTML = `<strong>Subjects:</strong> ${book.subject.slice(0, 5).join(", ")}`;
          bookDiv.appendChild(subjectEl);
        }

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
  const term = document.getElementById("search-box").value.trim();
  if (term) getBook(term);
}

// Run on load
window.onload = function () {
  getBook();
};
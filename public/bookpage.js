//fetch backend data

function getBook(searchTerm = "harry potter") {
  fetch(`/api?q=${encodeURIComponent(searchTerm)}`)
    .then(response => response.json())
    .then(data => {
      const output = document.getElementById("book-output");
      output.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      document.getElementById("book-output").textContent = "Error fetching data.";
      console.error("Fetch error:", error);
    });
}

function searchBooks() {
  const term = document.getElementById("search-box").value;
  getBook(term);
}
  
// Automatically run function when page loads
window.onload = function() {
  getBook();
};
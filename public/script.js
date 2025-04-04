// public/script.js

function getAllFlights() {
    fetch("/api/flights")
      .then(response => response.json())
      .then(data => {
        const output = document.getElementById("flight-output");
        output.textContent = JSON.stringify(data, null, 2);
      })
      .catch(error => {
        document.getElementById("flight-output").textContent = "Error fetching data.";
        console.error("Fetch error:", error);
      });
  }
  
  // Automatically run the function when the page loads
  window.onload = function() {
    getAllFlights();
  };
  
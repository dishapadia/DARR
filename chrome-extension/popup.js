// Listen for form submission
document.getElementById('classifyForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from reloading the page
  
    // Get the URL input value
    const urlInput = document.getElementById('urlInput').value;
    const resultDiv = document.getElementById('result');
  
    // Clear any previous result
    resultDiv.textContent = '';
  
    try {
      // Send a POST request to the backend's /classify endpoint
      const response = await fetch('http://localhost:8080/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlInput })
      });
  
      // If the server response is not OK, throw an error
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
  
      // Parse the JSON response from the backend
      const data = await response.json();
  
      // Display the result: classification for the URL
      resultDiv.textContent = `The site ${data.url} is classified as: ${data.classification}`;
    } catch (error) {
      console.error('Error:', error);
      resultDiv.textContent = `Error: ${error.message}`;
    }
  });
  
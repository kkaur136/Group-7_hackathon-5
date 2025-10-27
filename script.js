// DOM elements
const btn = document.getElementById("getQuoteBtn");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");

// Public API (no key required)
const API_URL = "https://api.quotable.io/random";

// Local fallback data (used if API fails)
const FALLBACK_QUOTES = [
  { content: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { content: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
  { content: "Whether you think you can or you think you can’t, you’re right.", author: "Henry Ford" },
  { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman" }
];

// Utility: set loading UI
function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Loading..." : "Get a Random Quote";
}

// Utility: render a quote to the page
function renderQuote({ content, author }) {
  quoteText.textContent = `“${content}”`;
  quoteAuthor.textContent = author ? `— ${author}` : "— Unknown";
}

// Utility: render an error message
function renderError(message = "Something went wrong. Showing a fallback quote.") {
  quoteText.textContent = message;
  quoteAuthor.textContent = "";
}

// Get a random item from an array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Core: fetch one quote from API (throws on error)
async function fetchQuoteOnce() {
  const url = API_URL; // simple endpoint, no params needed
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) {
    // e.g., 404/500/rate-limit — turn into an error we can catch
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // Expecting shape: { content: string, author: string }
  if (!data || typeof data.content !== "string") {
    throw new Error("Unexpected API response shape");
  }
  return { content: data.content, author: data.author || "Unknown" };
}

// Public function: fetch with retry + fallback
async function getRandomQuote() {
  setLoading(true);
  renderQuote({ content: "Fetching something inspiring...", author: "" });

  try {
    // Try the API (with one quick retry if first attempt fails)
    try {
      const quote = await fetchQuoteOnce();
      renderQuote(quote);
    } catch (firstErr) {
      // brief retry
      const quote = await fetchQuoteOnce();
      renderQuote(quote);
    }
  } catch (finalErr) {
    // If API fails twice, show a fallback quote
    console.error("Quote fetch failed:", finalErr);
    renderError();
    renderQuote(pickRandom(FALLBACK_QUOTES));
  } finally {
    setLoading(false);
  }
}

// Wire up button click
btn.addEventListener("click", getRandomQuote);

//fetch one quote on page load for nicer UX
window.addEventListener("DOMContentLoaded", () => {
  renderQuote({ content: "Click the button to get a quote!", author: "" });
});

// auth-callback.js — Handles GitHub OAuth callback

// ✅ Your deployed Vercel backend endpoint
const BACKEND_URL = "https://ebillr-oauth-backend.vercel.app/api/auth/github-login";

// Get query parameters from URL
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

(async function handleAuthCallback() {
  const code = getQueryParam("code");
  const state = getQueryParam("state");
  const error = getQueryParam("error");

  if (error) {
    alert(`GitHub login error: ${error}`);
    window.location.href = "login.html";
    return;
  }

  if (!code) {
    alert("No authorization code found.");
    window.location.href = "login.html";
    return;
  }

  // Optional: validate state parameter
  const storedState = sessionStorage.getItem("oauth_state");
  if (storedState && state !== storedState) {
    alert("Auth failed (state mismatch). Return to login and try again.");
    window.location.href = "login.html";
    return;
  }

  try {
    // Send code to backend for token exchange
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        redirect_uri: "https://ebillr.github.io/auth-callback.html"
      })
    });

    const data = await response.json();

    if (data.error) {
      alert(`Error: ${data.error}`);
      window.location.href = "login.html";
      return;
    }

    // Save token securely in session storage
    sessionStorage.setItem("github_token", data.access_token);

    // Redirect to dashboard
    window.location.href = "e-billr.html";
  } catch (err) {
    alert(`Request failed: ${err.message}`);
    window.location.href = "login.html";
  }
})();

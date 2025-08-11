const BACKEND_URL = "https://ebillr-oauth-backend.vercel.app/api/auth/github-login";

(async function handleAuthCallback() {
  const code = new URLSearchParams(window.location.search).get("code");
  const state = new URLSearchParams(window.location.search).get("state");
  const storedState = sessionStorage.getItem("oauth_state");

  if (!code || !state || state !== storedState) {
    alert("Authentication failed. Please log in again.");
    return (window.location.href = "login.html");
  }

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        redirect_uri: "https://ebillr.github.io/auth-callback.html"
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.error || !data.access_token) {
      throw new Error(data.error || "No access token returned");
    }

    // Store token + login flag
    sessionStorage.setItem("github_token", data.access_token);
    sessionStorage.setItem("is_logged_in", "true");

    window.location.href = "e-billr.html";
  } catch (err) {
    alert(`Login failed: ${err.message}`);
    window.location.href = "login.html";
  }
})();

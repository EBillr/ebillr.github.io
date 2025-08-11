/* assets/js/auth-callback.js
   - Validates state from sessionStorage
   - Sends code + verifier to server exchange endpoint
   - Stores session via eb_setSession (session.js must define it)
*/
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  // read expected values from sessionStorage (set by login.js)
  const storedState = sessionStorage.getItem('pkce_state');
  const verifier = sessionStorage.getItem('pkce_verifier');

  // Basic validation
  if (!code || !state || !storedState || state !== storedState) {
    console.error('PKCE/state mismatch', { code, state, storedState });
    alert('Auth failed (state mismatch). Returning to login.');
    // cleanup just in case
    sessionStorage.removeItem('pkce_state');
    sessionStorage.removeItem('pkce_verifier');
    window.location.href = 'login.html';
    return;
  }

  // Replace with your server endpoint that performs server-side token exchange.
  // MUST be HTTPS and accessible from the browser.
  // Example: 'https://your-server.example.com/auth/exchange'
  const EXCHANGE_ENDPOINT = '/auth/exchange'; // <<--- update this to your server URL if different

  try {
    // send code + verifier to server for secure exchange (server uses client_secret)
    const resp = await fetch(EXCHANGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        redirect_uri: 'https://ebillr.github.io/auth-callback.html' // must match GitHub app
      })
    });

    if (!resp.ok) {
      const text = await resp.text().catch(()=>null);
      throw new Error(`Exchange failed: ${resp.status} ${resp.statusText} ${text||''}`);
    }

    const data = await resp.json();

    if (!data.access_token) {
      throw new Error('No access_token in exchange response: ' + JSON.stringify(data));
    }

    // optionally include user object from server if returned
    const sessionObj = {
      token: data.access_token,
      user: data.user || null
    };

    // store session using global helper (session.js should define eb_setSession)
    if (typeof window.eb_setSession === 'function') {
      window.eb_setSession(sessionObj);
    } else {
      // fallback
      sessionObj.createdAt = Date.now();
      localStorage.setItem('eb_session', JSON.stringify(sessionObj));
    }

    // cleanup PKCE storage
    sessionStorage.removeItem('pkce_state');
    sessionStorage.removeItem('pkce_verifier');

    // redirect to dashboard
    window.location.href = 'e-billr.html';
  } catch (err) {
    console.error('Auth exchange error:', err);
    alert('Auth exchange failed: ' + err.message);
    // cleanup
    sessionStorage.removeItem('pkce_state');
    sessionStorage.removeItem('pkce_verifier');
    window.location.href = 'login.html';
  }
});

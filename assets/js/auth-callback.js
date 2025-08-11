/* assets/js/auth-callback.js */
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const savedState = localStorage.getItem('pkce_state');
  const verifier = localStorage.getItem('pkce_verifier');

  if (!code || !state || !savedState || state !== savedState){
    alert('Auth failed (state mismatch). Return to login and try again.');
    window.location.href = 'login.html';
    return;
  }

  // IMPORTANT: set this to your token-exchange server endpoint (server must hold client_secret)
  // e.g. const EXCHANGE_ENDPOINT = 'https://my-server.com/auth/exchange'
  const EXCHANGE_ENDPOINT = '/auth/exchange';

  try {
    const resp = await fetch(EXCHANGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        redirect_uri: window.location.origin + '/auth-callback.html'
      })
    });
    if (!resp.ok){
      const text = await resp.text();
      throw new Error('Exchange failed: ' + text);
    }
    const data = await resp.json();
    if (!data.access_token){
      throw new Error('No access token returned from exchange endpoint.');
    }

    // server returned token + optionally user data
    const session = {
      token: data.access_token,
      user: data.user || null
    };
    // store session
    window.eb_setSession(session);

    // cleanup PKCE
    localStorage.removeItem('pkce_state');
    localStorage.removeItem('pkce_verifier');

    // Go to dashboard
    window.location.href = 'e-billr.html';
  } catch (err){
    console.error(err);
    alert('Auth exchange error: ' + err.message);
    window.location.href = 'login.html';
  }
});

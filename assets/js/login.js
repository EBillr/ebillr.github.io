/* assets/js/login.js
   - PKCE + state stored in sessionStorage (survives redirect)
   - REDIRECT_URI hardcoded to your GitHub Pages location
*/
(function(){
  const CLIENT_ID = "Ov23liQgRHKpfR6JJzHi";
  const REDIRECT_URI = "https://ebillr.github.io/auth-callback.html"; // HARD-CODED
  const SCOPE = "repo user";
  const LOGIN_BTN_ID = "github-login-btn";

  function base64url(buffer){
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (let i=0;i<bytes.byteLength;i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  async function sha256(str){
    const enc = new TextEncoder().encode(str);
    return await crypto.subtle.digest('SHA-256', enc);
  }

  function randStr(len=64){
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => ('0' + (b % 36).toString(36)).slice(-1)).join('');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const btn = document.getElementById(LOGIN_BTN_ID);
    if (!btn) {
      console.warn('Login button not found:', LOGIN_BTN_ID);
      return;
    }

    // create fresh PKCE state & verifier (session-scoped)
    const state = randStr(16);
    const verifier = randStr(64);
    sessionStorage.setItem('pkce_state', state);
    sessionStorage.setItem('pkce_verifier', verifier);

    // build challenge
    const digest = await sha256(verifier);
    const challenge = base64url(digest);

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(challenge)}&code_challenge_method=s256`;

    // DEBUG: show the exact URL in console (check redirect_uri param)
    console.log('GitHub authorize URL:', authUrl);

    btn.setAttribute('href', authUrl);
  });
})();

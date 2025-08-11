(function(){
  const CLIENT_ID = "Ov23liQgRHKpfR6JJzHi";
  const REDIRECT_URI = "https://e-billr.github.io/auth-callback.html"; // Fixed to your exact GitHub Pages URL
  const SCOPE = "repo user";

  function base64url(buffer){
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
      .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  async function sha256(str){
    const buf = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', buf);
  }

  function randomString(len){
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b=>(b%36).toString(36)).join('');
  }

  const btn = document.getElementById('github-login-btn');
  if (!btn) return;

  const state = randomString(16);
  const verifier = randomString(64);
  localStorage.setItem('pkce_state', state);
  localStorage.setItem('pkce_verifier', verifier);

  sha256(verifier).then(hash => {
    const challenge = base64url(hash);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&state=${state}&code_challenge=${challenge}&code_challenge_method=s256`;
    btn.href = authUrl;
  });
})();

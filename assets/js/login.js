document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("github-login-btn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
      sessionStorage.setItem("oauth_state", state);

      const params = new URLSearchParams({
        client_id: "Ov23liQgRHKpfR6JJzHi",
        redirect_uri: "https://ebillr.github.io/auth-callback.html",
        scope: "repo user",
        state: state
      });

      window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
    });
  } else {
    console.error("GitHub login button not found in DOM.");
  }
});

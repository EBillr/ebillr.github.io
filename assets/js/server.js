// server.js - minimal Express auth exchange + optional proxy
// install: npm i express node-fetch cors dotenv
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set in env');
}

// Exchange code endpoint
app.post('/auth/exchange', async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body;
  if (!code) return res.status(400).json({ message: 'missing code' });

  try {
    // Exchange code for access token
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri,
        code_verifier
      })
    });
    const tokenJson = await tokenResp.json();
    if (tokenJson.error) return res.status(400).json(tokenJson);

    const access_token = tokenJson.access_token;
    // fetch user for convenience
    const userResp = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}`, Accept: 'application/vnd.github.v3+json' }
    });
    const user = await userResp.json();

    return res.json({ access_token, scope: tokenJson.scope, token_type: tokenJson.token_type, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'exchange failed' });
  }
});

// OPTIONAL: lightweight proxy routes (if you prefer server to call GitHub)
// e.g., POST /api/repos/:owner/:repo/contents -> creates/updates file
// Implement only if you want server-mediated GitHub actions (adds extra security)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));

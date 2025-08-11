// server.js
import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const CLIENT_ID = "Ov23liQgRHKpfR6JJzHi";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET"; // from GitHub OAuth settings

app.post('/auth/exchange', async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body;
  try {
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri,
        code_verifier
      })
    });
    const tokenData = await tokenResp.json();
    res.json(tokenData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('OAuth server running on port 3000'));

// server.js
import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const CLIENT_ID = "Ov23liQgRHKpfR6JJzHi";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET"; // from GitHub OAuth app settings

app.post('/auth/exchange', async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body;

  if (!code || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri,
        code_verifier
      })
    });

    const tokenData = await tokenResp.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || 'Token exchange failed' });
    }

    res.json(tokenData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('OAuth server running on port 3000'));

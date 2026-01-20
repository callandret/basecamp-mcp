import express from 'express';
import open from 'open';
import fs from 'fs';
import path from 'path';
const TOKEN_FILE = path.join(process.env.HOME || '', '.basecamp-mcp-tokens.json');
export async function getAccessToken(clientId, clientSecret, redirectUri) {
    // Check for existing valid token
    if (fs.existsSync(TOKEN_FILE)) {
        const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
        if (tokens.expires_at > Date.now()) {
            return tokens;
        }
        // Refresh if expired
        if (tokens.refresh_token) {
            return await refreshAccessToken(clientId, clientSecret, tokens.refresh_token);
        }
    }
    // Start OAuth flow
    return await startOAuthFlow(clientId, clientSecret, redirectUri);
}
async function startOAuthFlow(clientId, clientSecret, redirectUri) {
    return new Promise((resolve, reject) => {
        const app = express();
        let server;
        app.get('/callback', async (req, res) => {
            const code = req.query.code;
            if (!code) {
                res.send('Error: No authorization code received');
                reject(new Error('No authorization code'));
                return;
            }
            try {
                // Exchange code for token
                const tokenUrl = new URL('https://launchpad.37signals.com/authorization/token');
                tokenUrl.searchParams.set('type', 'web_server');
                tokenUrl.searchParams.set('client_id', clientId);
                tokenUrl.searchParams.set('client_secret', clientSecret);
                tokenUrl.searchParams.set('redirect_uri', redirectUri);
                tokenUrl.searchParams.set('code', code);
                const response = await fetch(tokenUrl.toString(), { method: 'POST' });
                const data = await response.json();
                // Get account info
                const authResponse = await fetch('https://launchpad.37signals.com/authorization.json', {
                    headers: { Authorization: `Bearer ${data.access_token}` }
                });
                const authData = await authResponse.json();
                // Find Basecamp 4 account
                const bc4Account = authData.accounts.find((a) => a.product === 'bc3');
                const tokens = {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires_at: Date.now() + (data.expires_in * 1000),
                    account_id: bc4Account?.id || ''
                };
                fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
                res.send('Authorization successful! You can close this window.');
                server.close();
                resolve(tokens);
            }
            catch (error) {
                res.send('Error during authorization');
                reject(error);
            }
        });
        server = app.listen(3000, () => {
            const authUrl = `https://launchpad.37signals.com/authorization/new?type=web_server&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
            console.log('Opening browser for authorization...');
            open(authUrl);
        });
    });
}
async function refreshAccessToken(clientId, clientSecret, refreshToken) {
    const tokenUrl = new URL('https://launchpad.37signals.com/authorization/token');
    tokenUrl.searchParams.set('type', 'refresh');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('refresh_token', refreshToken);
    const response = await fetch(tokenUrl.toString(), { method: 'POST' });
    const data = await response.json();
    const existingTokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    const tokens = {
        ...existingTokens,
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000)
    };
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    return tokens;
}

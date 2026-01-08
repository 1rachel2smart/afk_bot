AFK Bot

1. Edit `bot.js` and replace `YOUR_SERVER_IP` (or set `MC_HOST`, `MC_PORT`, `MC_USER` env vars).

2. Install dependencies:

```bash
npm install
```

3. Run the bot:

```bash
node bot.js
```

Environment variables (optional):
- `MC_HOST` — server host (overrides `YOUR_SERVER_IP` in `bot.js`).
- `MC_PORT` — server port.
- `MC_USER` — bot username.

Notes:
- The bot uses `mineflayer-auto-eat`, `mineflayer-pathfinder`, and `mineflayer-armor-manager`.
- Change `AFK_ROOM_POS` in `bot.js` to your AFK room coordinates if you plan to use it.
- Configure auto-login: set `MC_PASSWORD` and/or `MC_SET_PASSWORD` env vars or adjust the `/login`/`/setpassword` commands in `bot.js`.
- Automatic "return to AFK room" behavior is disabled; you will teleport/place the bot where you want it to stay.

Run as a managed service (recommended):

- PM2 (easy):

```bash
# install pm2 globally if needed
npm install -g pm2
# start with the provided ecosystem file
pm2 start ecosystem.config.js
# to have pm2 restart on system boot
pm2 startup
pm2 save
```

- Systemd (example): create `/etc/systemd/system/afk-bot.service` with:

```ini
[Unit]
Description=AFK Bot
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/afk-bot
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl enable afk-bot
sudo systemctl start afk-bot
```

The bot will keep retrying to connect with exponential backoff if the server is offline; it will also attempt login on spawn if `MC_PASSWORD` / `MC_SET_PASSWORD` are set.

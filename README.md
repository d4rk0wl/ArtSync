# 🎨 WLED ArtSync

Turn **album art** into **WLED colors**. This tiny Express server receives Plex webhooks, extracts 2–3 colors using `node-vibrant`, and pushes them to WLED for an ambient effect. When playback stops, it can optionally fade back to white.

---

## ⚙️ Requirements
- Node.js **v24.x** (if running locally) or Docker
- A WLED controller reachable from the container/host
- Plex Webhook configured to POST to this server

---

## 🚀 Quick Start (Docker)

1. Create `.env` (see **Config** below), or configure environment variables inside `docker-compose.yaml`
2. Build & run:
   ```bash
   docker compose up -d
    ```
3. Point your Plex webhook at:
    ```
    http://<server-ip>:<PORT>/
   ```

The server accepts `POST / ` with `multipart/form-data` containing:
* field `thumb` (the image)
* field `payload` (JSON payload from plex)

---

## 🔧 Configuration (.env)

Here's a helpful starting point:
```dotenv
# Server, defaults to port 8000
PORT=8000

# WLED controller (do not include http:// here)
WLEDADDR=x.x.x.x

# Which segment IDs to update (IDs are incremental)
SEGMENTS=[0,1,2]

# Behavior: return to white after genuine stop
# Use "true" or "false"
RETURNWHITE=true

# Grace period before returning to white (ms)
# Increase this to avoid flicker on track changes
WHITE_DELAY_MS=2000
```

---

## 📝Notes:

* With WLED RGBW strips, enable `Auto-White` in the LED preferences. This program sends simple RGB values; WLED derives the white channel.
* If you still see white flashes between songs, increase the `WHITE_DELAY_MS` (e.g. 2000 => 2500)
* Additional information on Plex webhooks can be found in [Plex Support](https://support.plex.tv/articles/115002267687-webhooks/)

---

## 🧠 How it works

1. Plex sends a webhook with a `thumb` image + JSON `payload`.
2. The image is saved to a temporary directly (via `multer`), `./tmp` and run `node-vibrant` to get a color palette.
3. Vibrant, Dark Vibrant and Light Vibrant color trio is picked and sent to WLED:
```json
{ "seg": [{ "id": 0, "col": [[47, 13, 219],[116, 85, 219],[46, 201, 26]] }] }
```
4. Existing WLED settings such as animation selection are not changed.
5. On `media.stop`, a request is sent to WLED to change to white (only if enabled in env var)


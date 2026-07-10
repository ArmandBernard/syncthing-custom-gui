# syncthing-custom-gui

A custom web UI for [Syncthing](https://syncthing.net/), inspired by Material 3.

There is no backend. The app talks directly to Syncthing's REST API (`/rest/...`) using an API key, stored in the
browser's `localStorage`.

## Running this project

This UI does not have feature parity with the original, so while you can replace your UI it is not recommended at
this stage.

### Running as a replacement

```
npm install
npm run build
```

This produces a static build in `dist/`. Since this app has no backend, it's meant to be served **by Syncthing itself**,
replacing its bundled WebUI:

1. Find Syncthing's GUI override directory by running `syncthing --paths` (look for "GUI override directory"), or set
   the `STGUIASSETS` environment variable to an absolute path when launching Syncthing.
2. Point that location at this project's `dist/` folder (copy the contents there, or set
   `STGUIASSETS=<path-to-repo>/dist`).
3. Restart Syncthing and open its GUI URL — the custom UI now loads from the same origin as the REST API, so no proxy or
   CORS configuration is needed in production.

### Running alongside the existing UI

If you'd prefer to run this UI separately, you can use the following to serve the UI at your preferred port.

```bash
npm run preview -- --port 1234
```

## Development

Requires a Syncthing instance running locally (or reachable over the network).

```bash
npm install
npm run dev
```

This starts the Vite dev server (default `http://localhost:5173`) and proxies requests to your local
Syncthing instance. The browser talks to Vite's own origin (bypassing CORS issues) and Syncthing's self-signed
HTTPS cert is trusted server-side by the proxy.

By default the proxy targets `https://127.0.0.1:8384` (Syncthing's default GUI address). If your instance runs
elsewhere, update the `server.proxy` targets in `vite.config.ts`.

Once the dev server is running, open it in a browser and paste in your Syncthing API key (found in Syncthing's
Settings → General) when prompted.

### Other development tips

Other useful scripts:

```
npm run lint          # run oxlint
npm run format        # format the codebase with Prettier
npm run format:check  # check formatting without writing changes
npm run preview       # preview a production build locally
```

It's encouraged to enable running Prettier on save.
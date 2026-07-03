# Syncthing GUI

A custom web UI for [Syncthing](https://syncthing.net/), built to replace its stock WebUI.

## Technologies

- **[Vite](https://vite.dev/)** — dev server and build tool
- **[React 19](https://react.dev/)** + **TypeScript** (strict mode) — UI
- **[TanStack Query](https://tanstack.com/query)** — data fetching/caching/polling for the Syncthing API
- **[Tailwind CSS v4](https://tailwindcss.com/)** (via `@tailwindcss/vite`) — styling
- **[oxlint](https://oxc.rs/docs/guide/usage/linter.html)** — linting
- **[Prettier](https://prettier.io/)** — formatting

There is no backend. The app talks directly to Syncthing's REST API (`/rest/...`) using an API key, stored in the
browser's `localStorage`.

## Architecture

- **`src/lib/syncthing/`** — a hand-written, type-safe representation of Syncthing's REST API (Syncthing has no official
  OpenAPI/JSON-Schema spec). `types/` holds request/response interfaces grouped by domain (system, config, db, folder,
  cluster, stats, events, misc); `endpoints/` maps each `'METHOD /path'` string to its `params`/`query`/`body`/
  `response` shape; `endpoints.ts` merges all of those into one `EndpointMap`. `client.ts` exports `syncthingRequest`, a
  generic function keyed off `EndpointMap` (e.g. `syncthingRequest('GET /system/status')`) — it resolves the API key
  from storage itself and throws a typed `SyncthingApiError` on failure.
- **`src/hooks/useSyncthingQuery.ts`** — a `useQuery` wrapper around `syncthingRequest` for use in components: same
  `'METHOD /path'` key plus whatever `params`/`query`/`body` that endpoint needs, with the query key auto-derived and
  the query automatically disabled until an API key is configured.
- **`src/hooks/ApiKeyProvider.tsx`** / **`ApiKeyContext.ts`** / **`useApiKey.ts`** — the API key is held in a single
  React Context (backed by `localStorage` via `src/lib/apiKey.ts`), mounted once at the root in `main.tsx`, so any
  component or hook can read/update it without prop-drilling.
- **`src/hooks/useServerStatus.ts`** — the first real consumer of `useSyncthingQuery`, polling `GET /system/ping` and
  mapping the query's state to `'checking' | 'online' | 'unauthorized' | 'offline'`.

## Development

Requires a Syncthing instance running locally (or reachable over the network).

```
npm install
npm run dev
```

This starts the Vite dev server (default `http://localhost:5173`) and proxies `/rest` and `/meta.js` requests to a local
Syncthing instance, so the browser only ever talks to Vite's own origin — no CORS issues, and Syncthing's self-signed
HTTPS cert is trusted server-side by the proxy.

By default the proxy targets `https://127.0.0.1:8384` (Syncthing's default GUI address). If your instance runs
elsewhere, update the `server.proxy` targets in `vite.config.ts`.

Once the dev server is running, open it in a browser and paste in your Syncthing API key (found in Syncthing's
Settings → General) when prompted.

Other useful scripts:

```
npm run lint          # run oxlint
npm run format        # format the codebase with Prettier
npm run format:check  # check formatting without writing changes
npm run preview       # preview a production build locally
```

It's encouraged to enable running Prettier on save.

## Building for production

```
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

Syncthing falls back to its own bundled assets for any file it doesn't find in the override directory, so make sure
`dist/` is served as a complete build (i.e. don't hand-pick individual files out of it).

# EIRA Stocktaking (Frontend)

Next.js frontend for stocktaking flows.

## Frontend

### Run

```bash
yarn dev
```

App runs on `http://localhost:3000`.

### Build

```bash
yarn build
```

### Production start

```bash
yarn start
```

## Deployment (simple)

```bash
yarn
yarn build
```

Copy these to the server:

- `.next`
- `public`
- `next.config.mjs`
- `package.json`
- `yarn.lock`
- `.env` (optional)

Start app on server with API base URL:

```bash
API_BASE_URL=http://172.x.x.x:8090 yarn start
```

Use `.env` only when you want a backend URL different from fallback.

Example `.env`:

```env
API_BASE_URL="http://172.x.x.x:8090"
```

## API Connection

Frontend calls local `/api/*` routes.

Those routes are proxied by `src/app/api/[...path]/route.js` to backend `/api/inventory/*`.

Backend base URL comes from `API_BASE_URL` when the server starts.
If `API_BASE_URL` is not set, fallback is `http://localhost:8088`.
To change API target, restart server with a new `API_BASE_URL` (no rebuild needed).

## Backend (surface info)

Backend service is a Spring Boot app (`eira-service`).

Frontend expects backend inventory endpoints under `/api/inventory/*`.


# TalkShore API setup

The API is hosted by the same Vercel project as the Control Tower. The browser application remains a Vite SPA, while every `/api/*` request is routed to the server function.

## Available URLs

| URL | Purpose |
| --- | --- |
| `/api` | Redirects to the API documentation |
| `/api/docs` | Interactive Swagger UI |
| `/api/openapi.json` | Generated OpenAPI contract |
| `/api/v1/health` | Public readiness response |
| `/api/v1/auth/me` | Current Firebase user and TalkShore profile |
| `/api/v1/profiles/me` | Create, read, or update the current profile |

## Local configuration

1. Copy `.env.example` to `.env.local`.
2. Keep the existing `VITE_FIREBASE_*` values for the browser application.
3. In Firebase Console, open **Project settings > Service accounts** and generate a private key for a server service account.
4. Add its project ID, client email, and private key to the three `FIREBASE_*` variables. Never use a `VITE_` prefix for these secrets.
5. Set `API_ALLOWED_ORIGINS` to a comma-separated list of frontend origins. Add both the Control Tower and TalkShore Voyage production URLs in Vercel.

For Vercel, add the same server variables under **Project Settings > Environment Variables** for Preview and Production. Preserve the literal `\n` sequences in `FIREBASE_PRIVATE_KEY`; the server converts them to newlines.

## SwaggerHub workflow

After deployment, import the generated contract into SwaggerHub using:

```text
https://YOUR-CONTROL-TOWER-DOMAIN/api/openapi.json
```

The code-owned contract should remain the source of truth because the same Zod schemas validate live requests. SwaggerHub can be used for review and collaboration, but changes made only in SwaggerHub will not create or update the actual handlers.

To test protected operations in Swagger UI:

1. Sign in through a TalkShore Firebase client.
2. Obtain the current user's ID token with `await auth.currentUser.getIdToken()`.
3. Select **Authorize** in Swagger UI.
4. Paste the ID token. Do not paste a password, Firebase service-account key, OpenAI key, or Stripe secret.
5. Call `GET /api/v1/auth/me` first to confirm identity and profile access.

## Adding an endpoint

For each route, add a Zod request schema, response schema, OpenAPI route definition, authorization middleware, and handler. Document every status the handler can return. Reuse component schemas rather than copying object definitions.

Run the checks before deployment:

```bash
npm run typecheck:api
npm run build
```

The health endpoint reports `degraded` until all Firebase Admin variables are configured. This is intentional and makes incomplete production configuration visible without exposing secret values.

## Automatic contract generation

The API routes and Zod schemas are the source of truth. Generate the checked-in Swagger contract with:

```bash
npm run openapi:generate
```

Confirm that the checked-in contract has not drifted from the implementation with:

```bash
npm run openapi:check
```

`npm run build` regenerates `docs/openapi.json` automatically before compiling the frontend. Add `npm run typecheck:api` and `npm run openapi:check` to continuous integration so an invalid or stale contract cannot be merged.

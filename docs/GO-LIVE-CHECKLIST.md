# Launch OS Go-Live Checklist

## Required environment variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ALLOWED_ORIGINS`
- `AI_API_ACCESS_TOKEN` if protecting browser-to-AI calls before auth is added
- `DATABASE_URL`
- `PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STARTUP_PACK_PRICE_ID`
- `STRIPE_SUBSCRIPTION_PRICE_ID`

## Commands

- Build: `pnpm build`
- Start: `pnpm start`
- Health check: `/`

## Before paid launch

- Add user auth and protect project/export routes.
- Connect database persistence to signed-in users once auth is added.
- Create Stripe Products/Prices and set webhook endpoint to `/api/billing/webhook`.
- Replace placeholder legal copy with attorney-reviewed policy text.
- Run final mobile QA on iOS Safari and Android Chrome.

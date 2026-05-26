# Launch OS Go-Live Checklist

## Required environment variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ALLOWED_ORIGINS`
- `AI_API_ACCESS_TOKEN` if protecting browser-to-AI calls before auth is added

## Commands

- Build: `pnpm build`
- Start: `pnpm start`
- Health check: `/`

## Before paid launch

- Add user auth and protect project/export routes.
- Add database persistence for brand profiles, assets, and export history.
- Add Stripe checkout and verified webhook handling.
- Replace placeholder legal copy with attorney-reviewed policy text.
- Run final mobile QA on iOS Safari and Android Chrome.

---
description: Scaffold a SQLHub frontend feature following the team's 7-step checklist
---

Use this command when starting a new frontend feature for SQLHub.

Feature / requirement: $ARGUMENTS

Follow the checklist in `CLAUDE.md`:

1. Create a branch from `develop` named `feat/<module>-<short-description>`.
2. Make sure the backend Swagger contract is ready, then run `npm run gen:api`.
3. Create the feature folder under `src/app/[language]/<module>/` (page,
   page-content, queries) and API hooks under `src/services/api/services/`.
4. Use TanStack Query with `createQueryKeys` from
   `src/services/react-query/query-key-factory.ts`; keep server data out of
   component state.
5. Add every user-facing string to both `src/services/i18n/locales/en/` and
   `src/services/i18n/locales/vi/`. Use `getServerTranslation` for metadata and
   `useTranslation` for client pages.
6. Use `@/components/link` instead of `next/link`, and deep imports for lucide
   icons. Add a Playwright test when the feature affects sign-in or the lab flow.
7. Run `npm run lint`, `npx tsc --noEmit` and `npm run build`. Open a PR into
   `develop` and fill in the "AI đã giúp gì" section.

Before writing code:

- Read `CLAUDE.md`, `docs/architecture.md` and the closest existing feature under
  `src/app/[language]/`.
- Use the `generate` skill (`npm run generate:resource`) for admin CRUD screens;
  do not hand-write generated resource files.
- Keep changes inside the module folder owned by the assignee. Ask the Lead
  before editing shared files (`src/components/ui`, `src/services/auth`,
  `src/services/i18n/config.ts`, `src/app/[language]/layout.tsx`).
- Never commit `.env.local`, OAuth secrets or API keys.
- Do not store access tokens anywhere except the existing auth cookie helpers.

After writing code:

- Report the routes added, the API hooks used, the i18n namespaces touched and
  the verification commands.

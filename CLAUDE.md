# Widget

Backend (Fastify) and front (Svelte) serving the embeddable widgets of refugies.info. The front serves the iframe shown on partner sites and calls this backend, which reads the widget config and its contents from MongoDB.

## Git: never act without being asked

- **Never run `git commit`, `git push`, `gh pr create` or `gh pr edit` on your own initiative**, even when the code is finished and the checks pass. Leave the work in the working tree and say it is ready.
- A request to change something, including "on PR #N" or "on this branch", is **not** a request to commit or push it. Wait for an explicit "commit" / "push" / "open the PR" for the current task.
- An approval given for one task does not carry over to the next one.
- When asked to commit, check what is already staged first (`git diff --cached --name-only`): a commit takes the whole index.

## Scope and source of truth

- This service is **read-only**: it never writes to MongoDB. Widget configs are written by the editor in the `karfur` repo (`/api/webhook/widget-config/*`, model `WidgetConfig` in `@refugies-info/mongo`).
- The schema declared here is a minimal copy of `WidgetConfig` and `karfur` stays the source of truth. When the model changes there, update the schema here (the sample document in `widgetConfig.test.ts` mirrors a real one and is validated against it, so update both).
- A widget is identified by its `publicId` (random UUID, unique index). Never expose the Mongo `_id`.

## Security rules

- An unknown `publicId` and an `inactive` widget return the **same 404**, so the existence of a disabled widget is not revealed.
- Never return internal fields (`internalTitle`, `structureName`, `_id`, timestamps) in a response.
- The `Content-Security-Policy: frame-ancestors` header of the iframe is built from `authorizedDomains`. `Origin`/`Referer` checks on the API are only a safeguard, as they can be missing.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm lint`, `pnpm check-types`, `pnpm test` — run them for what you touched before committing.
- `pnpm format` to apply the Biome formatting.

## Coding conventions

- **Language**: everything (code, comments, commit messages, PR/issue text) is in English.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types and classes. Only named exports. Prefer a longer, descriptive name over a short, cryptic one.
- **Comments**: self-explanatory code first. Comment only what the code can't say (a workaround, a non-obvious rule), briefly.
- **Typing**: fully typed TypeScript, validate every external input (env, query, params) with zod.
- **Don't repeat yourself**: reuse an existing function rather than copy-pasting.
- **Logging**: `app.log.info/warn/error({ data }, "[functionName]")` with Fastify's logger, never `console`.
- **Testing**: build the app with `buildApp(config, database)` and use `app.inject`, with the database injected so tests don't need MongoDB.

## Before committing

- Commit messages follow the semantic prefixes (`feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`).
- See "Git: never act without being asked" above for when you are allowed to commit.

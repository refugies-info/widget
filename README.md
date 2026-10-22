# Widget

Embeddable widgets of [refugies.info](https://refugies.info). A partner site embeds an iframe, the iframe is served by the front, and the front calls this backend to get the widget config and the contents to display.

```
partner site ──iframe──▶ front (Svelte) ──▶ backend (Fastify) ──▶ MongoDB
                         /embed/:publicId     /widgets/:publicId    widgetconfigs, dispositifs
```

The widget configs are written by the editor of the [karfur](https://github.com/refugies-info/karfur) repo. This service only reads them.

## Status

Work in progress. Only the backend skeleton exists (`GET /health`). The `WidgetConfig` schema, `GET /widgets/:publicId` and the Svelte front are not implemented yet.

## Identifying a widget

A widget is identified by its `publicId`, a random UUID with a unique index, meant for the embed code. The Mongo `_id` is never exposed.

An unknown `publicId` and an `inactive` widget return the same 404. The iframe can only be displayed on the domains listed in the `authorizedDomains` of the widget, through the `Content-Security-Policy: frame-ancestors` header.

## Getting started

Requirements: Node.js 24+, [pnpm](https://pnpm.io) and a MongoDB database holding the `widgetconfigs` collection.

```bash
pnpm install
cp .env.example .env   # then set MONGODB_URI
pnpm dev
```

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | — (required) | MongoDB connection string, with the database name |
| `PORT` | `3000` | Port the server listens on |
| `HOST` | `0.0.0.0` | Host the server listens on |
| `LOG_LEVEL` | `info` | `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent` |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the server in watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Run the compiled server |
| `pnpm test` | Run the tests (no MongoDB needed) |
| `pnpm lint` | Lint with Biome |
| `pnpm check-types` | Type-check with `tsc` |
| `pnpm format` | Apply the Biome formatting |

## Project structure

```
src/
├── app.ts          # buildApp(config, database): builds the Fastify app
├── config.ts       # environment variables, validated with zod
├── db.ts           # MongoDB connection
├── server.ts       # entry point
└── routes/         # HTTP routes
```

## Contributing

Everything is written in English. Commit messages follow the semantic prefixes (`feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`). See [`CLAUDE.md`](CLAUDE.md) for the coding conventions and the security rules.

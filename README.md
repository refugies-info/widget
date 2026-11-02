# Widget

Embeddable widgets of [refugies.info](https://refugies.info). A partner site embeds an iframe, the iframe is served by the front, and the front calls this backend to get the widget config and the contents to display.

```
partner site ──iframe──▶ front (Svelte) ──▶ backend (Fastify) ──▶ MongoDB
                         /embed/:publicId     /widgets/:publicId    widget_config, dispositifs, themes, structures
```

The widget configs are written by the editor (`playground` repo) through the [karfur](https://github.com/refugies-info/karfur) API. This service only reads them.

## Status

Work in progress. The backend serves `GET /health`, `GET /widgets/:publicId` (the public config of an active widget) and `GET /widgets/:publicId/dispositifs?page=1&locale=fr` (the contents to display). The Svelte front is not implemented yet.

The config of a widget depends on its `type`. A `thumbnail` widget only has the common fields and a `dispositifId`: the contents route returns that single content if it is published (title, abstract and theme image). A `list` widget has filters, selected and excluded contents, a page size and a sort: the route returns a paginated list of full cards (theme, sponsor, location, raw price, commitment and update date, which the front formats). The image URLs are relative to refugies.info.

The contents route of a `list` widget also takes the filters of the visitor, one parameter per option of `filterBarOptions` (repeat a parameter for several values): `search` (keyword, 100 characters max), `departments`, `themes` (ids), `publics`, `statuses`, `frenchLevels`, `ages` and `languages`. The values of a category are OR-ed, the categories are AND-ed, and they only narrow down the list of the widget (selected contents included, excluded ones stay excluded). A parameter whose option is not in the filter bar, or any parameter when `displayFilterBar` is off, is ignored; an invalid value is a 400. A keyword is searched in Algolia and the contents come in the order of its results instead of the sort of the widget. `total` and `pageCount` reflect the search and the filters.

`GET /widgets/:publicId/filters?locale=fr` returns the values of the dropdowns of the filter bar, only for the enabled options: `departments` (a fixed list), `themes` (`id`, `name` in the locale with a French fallback, `color`) and `languages` (`code`, `name`, `localName`). The themes and the languages are read from MongoDB.

## Identifying a widget

A widget is identified by its `publicId`, a random UUID with a unique index, meant for the embed code. The Mongo `_id` is never exposed.

An unknown `publicId` and an `inactive` widget return the same 404. The iframe can only be displayed on the domains listed in the `authorizedDomains` of the widget, through the `Content-Security-Policy: frame-ancestors` header.

## Getting started

Requirements: Node.js 24+, [pnpm](https://pnpm.io) and a MongoDB database holding the `widget_config` collection.

```bash
pnpm install
cp .env.example .env   # then set MONGODB_URI
pnpm dev
```

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | — (required) | MongoDB connection string, with the database name |
| `ALGOLIA_APP_ID` | — (required) | Algolia application id |
| `ALGOLIA_SEARCH_API_KEY` | — (required) | Algolia **search-only** key, never the admin key |
| `ALGOLIA_INDEX_NAME` | — (required) | Algolia index of the environment (production or staging) |
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
├── modules/        # one folder per domain object (schema, repository, presenter)
└── routes/         # HTTP routes
```

## Contributing

Everything is written in English. Commit messages follow the semantic prefixes (`feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`). See [`CLAUDE.md`](CLAUDE.md) for the coding conventions and the security rules.

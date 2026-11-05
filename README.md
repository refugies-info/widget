# Widget

Embeddable widgets of [refugies.info](https://refugies.info). A partner site embeds an iframe, the iframe is served by the front, and the front calls this backend to get the widget config and the contents to display.

```
partner site ──iframe──▶ front (Svelte) ──▶ backend (Fastify) ──▶ MongoDB
                         /w/:publicId          /widgets/:publicId    widget_config, dispositifs, themes, structures
```

The widget configs are written by the editor (`playground` repo) through the [karfur](https://github.com/refugies-info/karfur) API. This service only reads them.

## Status

Work in progress. The backend serves `GET /health`, `GET /widgets/:publicId` (the public config of an active widget) and `GET /widgets/:publicId/dispositifs?page=1&locale=fr` (the contents to display). The Svelte front (`front/`) displays the `thumbnail` widget, with its language selector and its empty state; the `list` widget is not done yet. The backend also serves the built front on `GET /w/:publicId`, the page of the iframe, with a `frame-ancestors` header that only lets the `authorizedDomains` of the widget embed it.

The config of a widget depends on its `type`. A `thumbnail` widget only has the common fields and a `thumbnailDispositifId`: the contents route returns that single content if it is published (title, abstract and theme image). A `list` widget has filters, selected and excluded contents, a page size and a sort: the route returns a paginated list of full cards (theme, sponsor, location, raw price, commitment and update date, which the front formats). The image URLs are relative to refugies.info.

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
cp front/.env.example front/.env
pnpm build:front       # the backend serves front/dist on /w/:publicId
pnpm dev
```

To work on the front with hot reload, run `pnpm --filter widget-front dev` next to `pnpm dev`: it proxies the API calls to the backend on port 3001.

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | — (required) | MongoDB connection string, with the database name |
| `ALGOLIA_APP_ID` | — (required) | Algolia application id |
| `ALGOLIA_SEARCH_API_KEY` | — (required) | Algolia **search-only** key, never the admin key |
| `ALGOLIA_INDEX_NAME` | — (required) | Algolia index of the environment (production or staging) |
| `PORT` | `3000` | Port the server listens on |
| `HOST` | `0.0.0.0` | Host the server listens on |
| `LOG_LEVEL` | `info` | `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent` |

The front (`front/`) has its own variable, read when it is **built** (copy `front/.env.example` to `front/.env` for the local one). The data of an environment comes from its `MONGODB_URI` and `ALGOLIA_INDEX_NAME`; the links of the widgets come from this one, so build the front once per environment:

| Variable | Description |
|---|---|
| `VITE_SITE_URL` | Site of the environment: `http://localhost:3000`, `https://staging.refugies.info` or `https://refugies.info`. The build fails without it |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the server in watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Run the compiled server |
| `pnpm test` | Run the tests (no MongoDB needed) |
| `pnpm lint` | Lint with Biome |
| `pnpm check-types` | Type-check with `tsc` |
| `pnpm check-types:front` | Type-check the front with `svelte-check` |
| `pnpm build:front` | Build the front to `front/dist` (needs `VITE_SITE_URL`) |
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
front/              # Svelte front of the iframe (Vite), served by the backend
```

## Deployment

The service is hosted on GCP, like karfur, with a staging and a production environment. The [`Dockerfile`](Dockerfile) builds the backend and the front, and takes the site of the environment as a build argument (`--build-arg VITE_SITE_URL=https://staging.refugies.info`). The data and the secrets come from the environment variables of the service (`MONGODB_URI`, `ALGOLIA_*`), so each environment reads its own database and Algolia index.

The [`Checks`](.github/workflows/checks.yaml) workflow runs the lint, the types, the tests and the builds on every pull request. The [`Deploy`](.github/workflows/deploy.yaml) workflow runs on a push on the `staging` or `production` branch and triggers the Cloud Build trigger of the environment. It needs, in the GitHub environments `staging` and `production`:

- the variable `CLOUD_BUILD_TRIGGER_ID`, the id of the Cloud Build trigger of the environment;
- the secret `GCP_SA_KEY`, the key of the service account that can run it (or at the repository level).

The Cloud Build trigger of each environment runs [`cloudbuild.yaml`](cloudbuild.yaml): it builds the image, pushes it to Artifact Registry and deploys it to Cloud Run (`widget-staging`, `widget-production`), with the same substitutions as karfur plus:

| Substitution | Description |
|---|---|
| `_ENV` | `staging` or `production` (name of the Cloud Run service) |
| `_SITE_URL` | Site of the environment, given to the front as `VITE_SITE_URL` |
| `_MONGODB_VAR` | Secret Manager secret holding the `MONGODB_URI` (a read-only user per environment) |
| `_ALGOLIA_INDEX_VAR` | Secret holding the Algolia index of the environment: the one of the site, `REACT_APP_ALGOLIA_INDEX_STG` or `REACT_APP_ALGOLIA_INDEX_PROD` |
| `_REGISTRY_URL`, `_REGISTRY`, `_REGION`, `_SA`, `_VPC_CONNECTOR` | Same as the karfur triggers |

Algolia uses what the site already has: the application id (`_ALGOLIA_APP_ID`, `L9HYT1676M` by default) and the **search-only** key of the client of karfur (`_ALGOLIA_SEARCH_API_KEY_VAR`, `REACT_APP_ALGOLIA_API_KEY` by default). Never use the key of the server of karfur, it can write to the index. The service account of the widget only needs the accessor role on its own MongoDB secret and on these two Algolia secrets.

## Contributing

Everything is written in English. Commit messages follow the semantic prefixes (`feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`). See [`CLAUDE.md`](CLAUDE.md) for the coding conventions and the security rules.

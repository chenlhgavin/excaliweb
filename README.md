# ExcaliWeb

A self-hosted file manager and editor for [Excalidraw](https://excalidraw.com/) files with
filesystem-based persistence. Browse workspaces, create and organize drawings in folder
hierarchies, and let auto-save keep your work safe — all running on your own server with
no database or cloud dependency.

<!-- TODO: Add a screenshot of the application and place it at docs/screenshot.png -->

![ExcaliWeb Screenshot](docs/screenshot.png)

---

## Features

- **Workspace browsing** — open any directory and navigate nested folder hierarchies
- **Excalidraw editor** — full drawing toolset powered by Excalidraw 0.18
- **Auto-save** — changes saved automatically every 10 seconds
- **Keyboard save** — press Ctrl+S for an immediate manual save
- **File management** — create, rename, and delete files and folders
- **Session persistence** — remembers your last workspace and open file across sessions
- **Docker deployment** — production-ready image with nginx reverse proxy and volume-based storage
- **REST API** — server-side endpoints for all file and workspace operations

---

## Prerequisites

- **Docker** (recommended for production) — or:
- **Node.js 20+** and **npm** (for local development)
- A modern browser (Chrome, Firefox, Safari, Edge)

---

## Quick Start

### Docker (Recommended)

The Docker image bundles the built frontend, backend, and an nginx reverse proxy into a
single container. A local directory is mounted as a volume for persistent storage.

```bash
# Create a local directory for your drawings
mkdir -p ./data

# Build the image and start the container
docker-compose up -d
```

Access the app at **http://localhost:5174**.

Your drawings are stored in the `./data` directory on the host and persist across
container restarts. The container exposes port 5174 by default and maps it to the
internal nginx server on port 80.

To manage the running container:

```bash
docker-compose logs -f      # follow container logs
docker-compose down         # stop and remove the container
```

You can also use `make deploy` to build the image and start the container in one step.
Run `make help` to see all available Make targets (`build`, `deploy`, `status`, `logs`,
`clean`).

### Local Installation

Run the application locally without Docker for development and debugging.

```bash
# Clone the repository
git clone https://github.com/<your-username>/excaliweb.git
cd excaliweb

# Install dependencies for both client and server
npm run install:all

# Start the frontend and backend dev servers together
npm run dev:all
```

The frontend dev server runs at **http://localhost:5173** and proxies API requests
to the backend at **http://localhost:3001**.

> **Tip:** You can also start the servers individually — `npm run dev` for the
> Vite client dev server and `npm run dev:server` for the Express backend — if
> you prefer separate terminal output.

To create a production build without Docker:

```bash
npm run build:all
```

This compiles the TypeScript server and bundles the Vite client into static assets.

---

## Configuration

Key environment variables (set in `docker-compose.yml` or exported in your shell):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `/app/data` | Path where all drawings are stored |
| `DEFAULT_WORKSPACE` | `true` (in Docker) | Auto-create a default workspace on startup |
| `DEFAULT_WORKSPACE_NAME` | `my-workspace` | Name of the auto-created workspace folder |
| `PORT` | `3001` | Backend server port |

When `DATA_DIR` is set, all file operations are restricted to that directory for security.
This prevents directory traversal and ensures the application cannot read or write files
outside the configured storage boundary.

In development (without Docker), `DATA_DIR` is not set by default and the application
allows browsing any directory accessible to the server process. Set `DATA_DIR` explicitly
if you want to restrict access during local development as well.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Excalidraw |
| Backend | Node.js 20, Express, TypeScript |
| Deployment | Docker, nginx, supervisord |

---

## Development

For coding standards, see [`CLAUDE.md`](CLAUDE.md). For architecture details and
internal design documentation, see [`.coda.md`](.coda.md).

```bash
npm run lint          # ESLint on the client code
npm test              # Playwright end-to-end tests
npm run build:all     # production build (client + server)
```

---

## Contributing

Contributions are welcome! Here is the standard workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes and push the branch
4. Open a Pull Request

Before submitting, please make sure linting and tests pass:

```bash
# Lint the client code
npm run lint

# Run end-to-end tests (requires Playwright browsers)
npx playwright install   # first time only
npm test
```

If you are adding a new feature, consider updating or adding Playwright tests in the
`tests/` directory to cover the new behavior.

For bug reports and feature requests, please open an issue on the GitHub repository.

---

## License

MIT License

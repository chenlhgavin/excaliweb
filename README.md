# ExcaliWeb

A self-hosted web application wrapping [Excalidraw](https://excalidraw.com/) with persistent file storage and folder management.

## Features

- File and folder management — create, rename, delete `.excalidraw` files and folders
- Full Excalidraw editor — all drawing tools, shapes, and export options
- Folder navigation with hierarchical tree
- Auto-save every 10 seconds, plus quick save with `Ctrl+S` / `Cmd+S`
- Workspace switching
- Single-container Docker deployment

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (or Docker + Make)
- [Git](https://git-scm.com/) (to clone the repository)

## Quick Start

```bash
git clone https://github.com/chenlhgavin/excaliweb.git
cd excaliweb
make deploy
```

Open `http://localhost:5174` in your browser.

Run `make logs` to verify the application started successfully.

## Configuration

### Custom port

```bash
make deploy PORT=8080
```

The application will be available at `http://localhost:8080`.

### Custom data directory

```bash
make deploy DATA_DIR=/path/to/drawings
```

### File ownership (PUID/PGID)

`make deploy` automatically detects your host UID and GID so that files created inside the container match your host user. To override manually:

```bash
make deploy PUID=1000 PGID=1000
```

### Using docker-compose

As an alternative to Make:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

To customize the port, volume mount, or environment variables, edit `docker/docker-compose.yml` directly. Note that the compose file does not auto-detect PUID/PGID — add them to the `environment` section if needed.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATA_DIR` | `/app/data` | Data storage path inside the container |
| `DEFAULT_WORKSPACE` | `true` | Auto-load workspace on start |
| `PUID` | `1000` | File owner UID |
| `PGID` | `1000` | File owner GID |
| `PORT` | `3001` | Backend server port (internal) |
| `NODE_ENV` | `production` | Node.js environment |

## Data Storage

All `.excalidraw` files live in the mounted data directory. By default this is `./data` on the host, mapped to `/app/data` inside the container.

The directory contains plain `.excalidraw` JSON files organized in folders — easy to back up, migrate, or version-control.

PUID/PGID ensures files created in the container match your host user ownership, avoiding permission mismatches.

## Makefile Reference

| Target | Description |
|---|---|
| `make help` | Show available commands |
| `make build` | Build the Docker image |
| `make deploy` | Build and run the container |
| `make status` | Check container status |
| `make logs` | View container logs (follow mode) |
| `make clean` | Stop and remove container and image |

## Troubleshooting

**Port already in use**

The default port is 5174. If it's occupied, either free it or deploy on a different port:

```bash
make deploy PORT=8080
```

**Docker permission issues**

If files created by the container have wrong ownership, redeploy with your current UID/GID:

```bash
make deploy PUID=$(id -u) PGID=$(id -g)
```

**Container won't start**

Check the logs, clean up, and redeploy:

```bash
make logs
make clean
make deploy
```

## License

MIT

## Acknowledgments

- [Excalidraw](https://excalidraw.com/) — The whiteboard engine
- [Vite](https://vitejs.dev/) — Build tooling
- [React](https://react.dev/) — UI framework
- [Express](https://expressjs.com/) — Backend framework



# Task: update-readme

## Overview

Rewrite `README.md` from a developer-oriented reference document into a concise, end-user-facing guide for self-hosting ExcaliWeb. The current README mixes deployment instructions with internal details (project structure tree, API endpoint table, development scripts, architecture diagram) that are irrelevant to someone who just wants to run the application. The new README will focus exclusively on what ExcaliWeb is, how to deploy it via Docker, how to configure it, and how to troubleshoot common issues.

## Target Audience

End users who want to self-host ExcaliWeb on their own server or local machine. They are comfortable with Docker and basic command-line usage but are not contributors or developers of the project. They need to go from zero to a running instance as quickly as possible.

## Content Outline

### 1. Title + One-liner
- `# ExcaliWeb`
- A single sentence: self-hosted web application wrapping Excalidraw with persistent file storage and folder management.

### 2. Features
- File and folder management (create, rename, delete `.excalidraw` files and folders)
- Full Excalidraw editor (all drawing tools, shapes, export)
- Folder navigation with hierarchical tree
- Auto-save (every 10 seconds) and quick save (`Ctrl+S` / `Cmd+S`)
- Workspace switching
- Docker single-container deployment
- **Remove**: "Path Isolation" and any security implementation details — these are internal concerns.

### 3. Prerequisites
- New section not in current README.
- Docker and Docker Compose (or Docker + Make)
- Git (to clone the repository)

### 4. Quick Start
- Three steps only:
  1. `git clone` + `cd`
  2. `make deploy`
  3. Open `http://localhost:5174`
- Mention `make logs` to verify startup.

### 5. Configuration
- Consolidate current "Makefile Commands" and "Environment Variables" sections into one.
- Subsections:
  - **Custom port**: `make deploy PORT=8080`
  - **Custom data directory**: `make deploy DATA_DIR=/path/to/drawings`
  - **File ownership (PUID/PGID)**: explain that `make deploy` auto-detects host UID/GID; show manual override `make deploy PUID=1000 PGID=1000`
  - **Using docker-compose**: show `docker-compose -f docker/docker-compose.yml up -d` as an alternative to Make; note that users should edit `docker-compose.yml` for custom port/volume/env.
- Environment variables table (keep from current README):
  - `DATA_DIR`, `DEFAULT_WORKSPACE`, `PUID`, `PGID`, `PORT`, `NODE_ENV`

### 6. Data Storage
- All `.excalidraw` files live in the mounted data directory (default: `./data` on host, `/app/data` in container).
- The directory is a plain folder of `.excalidraw` JSON files — easy to back up, migrate, or version-control.
- PUID/PGID ensures files created in the container match host user ownership.

### 7. Makefile Reference
- Brief table of all Make targets: `help`, `build`, `deploy`, `status`, `logs`, `clean`.
- One line description each — no verbose examples (those belong in Quick Start / Configuration above).

### 8. Troubleshooting
- Keep existing three scenarios from current README:
  - Port already in use
  - Docker permission issues
  - Container won't start
- Each with a short explanation and copy-paste fix command.

### 9. License
- `MIT` — keep as-is.

### 10. Acknowledgments
- Keep current list: Excalidraw, Vite, React, Express.

### Removed Sections (not relocated)
- Architecture diagram (`Browser → Nginx → Express → File System`)
- Tech stack bullet points (`React 19 + TypeScript + Vite 7...`)
- Project Structure tree (entire directory listing)
- API endpoint table (all 13 routes)
- Development section (available scripts, security internals)

## Development Phases

### Phase 1: Rewrite README.md
- **Goal**: Replace the current README with a user-facing deployment guide.
- **Tasks**:
  - Rewrite `README.md` following the content outline above.
  - Verify all `make` commands and flags against `Makefile` (e.g., `DATA_DIR`, `PORT`, `PUID`, `PGID` variable names).
  - Verify `docker-compose` command and file path against `docker/docker-compose.yml`.
  - Ensure no developer-only content remains (no project structure, no API table, no dev scripts).
- **Commit message**: `docs: rewrite README for end-user self-hosting focus`

## References

- Current `README.md` — source of existing content to selectively retain
- `Makefile` — authoritative source for Make targets and variable names
- `docker/docker-compose.yml` — authoritative source for compose configuration and environment variables
- `docker/Dockerfile` — for verifying build context and base image details
- `docker/entrypoint.sh` — for PUID/PGID behavior description

## Risk & Trade-offs

- **No developer documentation in repo**: Contributors who clone the repo will have no README guidance for local development, project structure, or API endpoints. This is an accepted trade-off; the `.coda.md` file remains as an internal reference, and developer docs can be added separately later if needed.
- **No published Docker image**: The Quick Start requires `git clone` + local build, which is a higher friction path than `docker pull`. This is a known limitation given the current decision not to publish images.
- **Troubleshooting coverage**: Only three scenarios are documented. Real-world issues may be more varied, but these can be expanded over time based on user feedback.
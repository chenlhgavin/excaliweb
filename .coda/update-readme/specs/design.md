

# Task: update-readme

## Overview

Rewrite `README.md` from scratch to serve as an effective open-source project landing page. The current README is ~550 lines with a flat structure that mixes quick-start information with deep reference material (API docs, troubleshooting, project structure, future roadmaps). This makes it hard for a new visitor to quickly understand what the project is and how to get it running.

The new README targets ~150-200 lines, focused on project positioning, key features, and getting started. Detailed reference content (API docs, troubleshooting, etc.) is intentionally omitted — it can be moved to a `docs/` directory in a future task.

## Target Audience

Open-source community visitors arriving at the GitHub repository for the first time. They need to:

1. Understand what ExcaliWeb is and why it exists (within 10 seconds)
2. See key features at a glance
3. Get the application running locally (within 5 minutes)
4. Know how to configure it for their environment
5. Know how to contribute

## Content Outline

### 1. Title + Tagline
- `# ExcaliWeb`
- One-line description: self-hosted file manager and editor for Excalidraw files with filesystem-based persistence
- Screenshot reference (keep `![ExcaliWeb Screenshot](docs/screenshot.png)` — file doesn't exist yet but preserves intent; add HTML comment noting screenshot is needed)

### 2. Features
- 6-8 bullet points, one line each, no sub-descriptions
- Cover: workspace/folder browsing, Excalidraw editor integration, auto-save, file CRUD operations, session persistence, Docker deployment, REST API
- Use bold lead word + short description pattern (e.g., **Auto-save** — changes saved every 10 seconds)

### 3. Quick Start

#### Docker (Recommended)
- Three commands: `mkdir -p ./data`, `docker-compose up -d`, access URL
- Mention `make deploy` as alternative, one line

#### Development
- Four commands: `git clone`, `npm run install:all`, `npm run dev:all`, access URL
- Note the two ports (5173 frontend, 3001 backend)

### 4. Configuration
- Single table with key environment variables only:
  - `DATA_DIR` — data storage path (default: `/app/data`)
  - `DEFAULT_WORKSPACE` — auto-create workspace on start (default: `true` in Docker)
  - `DEFAULT_WORKSPACE_NAME` — workspace folder name (default: `my-workspace`)
  - `PORT` — backend server port (default: `3001`)
- One sentence noting that when `DATA_DIR` is set, all file operations are restricted to that directory for security

### 5. Tech Stack
- Compact table, three rows: Frontend, Backend, Deployment
  - Frontend: React 19, TypeScript, Vite, Excalidraw
  - Backend: Node.js 20, Express, TypeScript
  - Deployment: Docker, nginx, supervisord

### 6. Contributing
- 3-4 line standard fork-branch-PR flow
- Mention `npm run lint` and `npm test` (Playwright)

### 7. License
- State MIT License
- Note: LICENSE file does not currently exist in the repository; this should be created separately

## Development Phases

### Phase 1: Rewrite README.md
- **Goal**: Replace the entire README.md with the new streamlined version
- **Tasks**:
  - Delete all existing content in `README.md`
  - Write new content following the Content Outline above, section by section
  - Verify all commands referenced are accurate against `package.json`, `docker-compose.yml`, and `Makefile`
  - Ensure the git clone URL uses a placeholder format (`<your-username>` or similar) consistently
  - Keep total line count between 150-200 lines
- **Commit message**: `docs: rewrite README.md for open-source audience`

## References

- Current `README.md` — source of existing content to distill
- `package.json` (root) — accurate npm script names: `install:all`, `dev:all`, `dev`, `dev:server`, `build:all`, `lint`, `test`
- `docker-compose.yml` — port mapping `5174:80`, environment variables, volume mount `./data:/app/data`
- `Makefile` — `make deploy`, `make build`, `make clean`, `make status`, `make logs`
- `Dockerfile` — Node 20 Alpine, multi-stage build, port 80, `/app/data` volume
- `client/package.json` — React 19.2, Excalidraw 0.18, Vite 7.2, TypeScript 5.9
- `server/package.json` — Express 4.18, TypeScript 5.3, tsx 4.7
- `specs/` directory — contains `idea.md`, `0001-spec.md`, `0002-volume-mount.md` for deeper context

## Risk & Trade-offs

- **Reduced information density**: Visitors needing API docs, troubleshooting, or architecture details will not find them in the README. This is intentional — a clean README converts better than a comprehensive one. Detailed docs should be added to `docs/` in a follow-up task.
- **Missing LICENSE file**: The README will reference MIT License, but no `LICENSE` file exists in the repo. This should be addressed in a separate task to avoid scope creep.
- **Missing screenshot**: `docs/screenshot.png` does not exist. The README will reference it with a note that it needs to be added. A broken image link on GitHub is a minor cosmetic issue until the screenshot is provided.
- **Removed content not relocated**: API documentation (~70 lines), troubleshooting (~60 lines), project structure (~50 lines), and other detailed sections are removed but not moved to `docs/`. This is a deliberate scope decision — relocation is a separate task.
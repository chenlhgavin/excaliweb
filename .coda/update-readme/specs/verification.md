


# Verification Plan: update-readme

## Automated Checks

- [ ] All pre-configured checks pass (these are irrelevant to a docs-only change but should not regress):
  - [ ] `cargo build`
  - [ ] `cargo +nightly fmt -- --check`
  - [ ] `cargo clippy -- -D warnings`

> Note: This is a documentation-only task. The pre-configured checks are for a Rust project and do not apply to this repository (TypeScript/Node.js). They are listed for completeness but will either be skipped or confirmed as not applicable.

## Functional Verification

### Section Presence

- [ ] Scenario 1: All required sections exist in order
  - Input: Read the final `README.md`
  - Expected: The following H2 sections appear in this order: Features, Prerequisites, Quick Start, Configuration, Data Storage, Makefile Reference, Troubleshooting, License, Acknowledgments

- [ ] Scenario 2: Title and one-liner are present
  - Input: Read the first two lines of `README.md`
  - Expected: `# ExcaliWeb` followed by a single-sentence description mentioning Excalidraw, persistent file storage, and folder management

### Section Absence (Removed Content)

- [ ] Scenario 3: No project structure tree
  - Input: Search `README.md` for `client/src/`, `server/src/`, `├──`, or `└──`
  - Expected: No matches

- [ ] Scenario 4: No API endpoint table
  - Input: Search `README.md` for `/api/workspace`, `/api/files`, `/api/filesystem`
  - Expected: No matches

- [ ] Scenario 5: No development scripts section
  - Input: Search `README.md` for `npm run dev`, `npm run lint`, `npm run install:all`, `npm run build`
  - Expected: No matches

- [ ] Scenario 6: No architecture diagram
  - Input: Search `README.md` for `Nginx (static files)`, `Nginx (reverse proxy)`, `Express.js`, `React 19`, `Vite 7`
  - Expected: No matches

- [ ] Scenario 7: No security implementation details
  - Input: Search `README.md` for `Path Isolation`, `CORS`, `directory traversal`, `su-exec`
  - Expected: No matches

### Content Accuracy

- [ ] Scenario 8: Quick Start uses correct commands
  - Input: Compare Quick Start commands against `Makefile`
  - Expected: `make deploy` is used (not `docker-compose`), default port is `5174`, `make logs` is mentioned for verification

- [ ] Scenario 9: Configuration examples match Makefile variables
  - Input: Compare variable names in Configuration section against `Makefile` lines `PORT :=`, `DATA_DIR ?=`, `PUID=`, `PGID=`
  - Expected: Variable names match exactly: `PORT`, `DATA_DIR`, `PUID`, `PGID`

- [ ] Scenario 10: docker-compose path is correct
  - Input: Check the docker-compose command in the Configuration section
  - Expected: References `docker/docker-compose.yml` (matches actual file location)

- [ ] Scenario 11: Environment variables table is complete and accurate
  - Input: Compare table against `docker/docker-compose.yml` environment section and `Makefile`
  - Expected: Table includes `DATA_DIR` (default `/app/data`), `DEFAULT_WORKSPACE` (default `true`), `PUID` (default `1000`), `PGID` (default `1000`), `PORT` (default `3001`), `NODE_ENV` (default `production`) — defaults match actual config files

- [ ] Scenario 12: Makefile Reference table covers all targets
  - Input: Compare listed targets against `.PHONY` line in `Makefile`
  - Expected: All targets listed: `help`, `build`, `deploy`, `status`, `logs`, `clean`

- [ ] Scenario 13: Troubleshooting commands are correct
  - Input: Verify each troubleshooting command against the README
  - Expected: "Port already in use" suggests `make deploy PORT=8080`, "Docker permission issues" uses `make deploy PUID=$(id -u) PGID=$(id -g)`, "Container won't start" uses `make logs` / `make clean` / `make deploy` recovery flow — all syntactically valid

### Prerequisites Section

- [ ] Scenario 14: Prerequisites lists required tools
  - Input: Read the Prerequisites section
  - Expected: Mentions Docker, Docker Compose (or Make + Docker), and Git. Does not mention Node.js, npm, or any development tooling.

## Edge Cases

- [ ] No broken Markdown formatting (unclosed code blocks, malformed tables, broken links)
- [ ] No references to `yourusername` or other placeholder URLs in git clone commands
- [ ] No leftover content from the old README that contradicts the new structure
- [ ] The Features section does not include internal/developer concerns (path isolation, CORS, etc.)
- [ ] No duplicate sections or repeated information across Quick Start, Configuration, and Makefile Reference
- [ ] License section still says MIT (not accidentally removed or altered)
- [ ] Acknowledgments still credit Excalidraw, Vite, React, Express

## Integration Points

- [ ] `README.md` is the only user-facing file modified — no other user-facing files should be created or changed (`.coda/` files are excluded from this constraint as they are internal CODA tracking artifacts)
- [ ] The `.coda.md` file is not modified (it continues to serve as internal reference)
- [ ] No new user-facing files are created (no `CONTRIBUTING.md`, no `docs/` files)

## Performance (if applicable)

Not applicable — documentation-only change.

## Security (if applicable)

- [ ] No secrets, internal paths, or sensitive configuration values are exposed in the README
- [ ] No references to internal network topology or server infrastructure beyond what's needed for deployment

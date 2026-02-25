

# Verification Plan: update-readme

## Automated Checks

- [ ] All pre-configured checks pass (N/A — this is a documentation-only change, no Rust code involved):
  - [ ] `cargo build` — skip, no Rust in this project
  - [ ] `cargo +nightly fmt -- --check` — skip
  - [ ] `cargo clippy -- -D warnings` — skip
- [ ] Existing tests still pass: `npx playwright test` (README change should not affect tests, but verify no accidental file changes)
- [ ] Markdown linting: file contains no syntax errors (valid Markdown per CommonMark spec)

## Functional Verification

### Structure & Sections

- [ ] Scenario 1: Document contains exactly 7 top-level sections in correct order
  - Input: Read the new `README.md`
  - Expected: Sections appear in this order: title/tagline (H1), Features (H2), Quick Start (H2), Configuration (H2), Tech Stack (H2), Contributing (H2), License (H2)

- [ ] Scenario 2: Line count is within target range
  - Input: `wc -l README.md`
  - Expected: Between 150 and 200 lines

- [ ] Scenario 3: No removed sections are still present
  - Input: Search for headings: "Architecture", "API Documentation", "Troubleshooting", "Project Structure", "Future Enhancements", "Browser Compatibility", "Keyboard Shortcuts", "Usage", "Security Considerations"
  - Expected: None of these headings appear

### Content Accuracy

- [ ] Scenario 4: npm script names match `package.json`
  - Input: Extract all `npm run <script>` references from README
  - Expected: Every script name exists in root `package.json` scripts: `install:all`, `dev:all`, `dev`, `dev:server`, `build:all`, `lint`, `test`

- [ ] Scenario 5: Docker commands match `docker-compose.yml`
  - Input: Check port number and volume mount references in README
  - Expected: Port is `5174` (host), volume is `./data:/app/data`, command is `docker-compose up -d`

- [ ] Scenario 6: Environment variable defaults match source files
  - Input: Cross-reference Configuration table against `docker-compose.yml` and `Dockerfile`
  - Expected:
    - `DATA_DIR` default is `/app/data`
    - `DEFAULT_WORKSPACE` default is `true` (in Docker context)
    - `PORT` default is `3001`

- [ ] Scenario 7: Tech stack versions match `package.json` files
  - Input: Compare versions in Tech Stack table against `client/package.json` and `server/package.json`
  - Expected: React 19, Excalidraw 0.18, Vite 7, Express 4, Node 20 (from Dockerfile base image)

- [ ] Scenario 8: `make deploy` is mentioned as an alternative
  - Input: Search README for `make deploy`
  - Expected: Appears once, as a brief alternative to docker-compose

### Formatting & Style

- [ ] Scenario 9: Features section uses correct formatting pattern
  - Input: Read Features section
  - Expected: 6-8 bullet points, each using **Bold lead** — description pattern, no nested bullets or multi-line descriptions

- [ ] Scenario 10: Screenshot reference is present with comment
  - Input: Search for screenshot image reference
  - Expected: `![ExcaliWeb Screenshot](docs/screenshot.png)` present, with an HTML comment nearby noting screenshot needs to be added

- [ ] Scenario 11: Git clone URL uses placeholder
  - Input: Search for `git clone` command
  - Expected: URL contains a placeholder (e.g., `<your-username>`) rather than a real username

## Edge Cases

- [ ] No trailing whitespace on lines (clean Markdown)
- [ ] File ends with a single newline character
- [ ] No broken Markdown table syntax (Configuration and Tech Stack tables render correctly)
- [ ] No HTML other than the screenshot comment (keep it pure Markdown otherwise)
- [ ] Code blocks use correct language hints (`bash` for shell commands)
- [ ] No duplicate headings at any level
- [ ] No empty sections (every heading has content below it)

## Integration Points

- [ ] Screenshot image path `docs/screenshot.png` is referenced but file does not exist — this is acknowledged and intentional
- [ ] LICENSE reference in License section — file does not exist in repo, README should state MIT but not link to a nonexistent file
- [ ] `specs/` directory is NOT referenced in the new README (detailed docs are out of scope)
- [ ] No references to removed content that would create dead links (e.g., no "see API Documentation section below")

## Performance (if applicable)

Not applicable — documentation-only change.

## Security (if applicable)

- [ ] The Configuration section mentions that `DATA_DIR` restricts file operations to the specified directory for security
- [ ] No secrets, tokens, or internal URLs are included in the README
- [ ] No real usernames or organization names in placeholder URLs
# Workflow Configuration

## Development Philosophy
Prioritize **functional verification** and **atomic development** over strict metric adherence.

## Testing Strategy
- **Core Logic Focus:** Unit tests are mandatory for:
  - Turndown HTML-to-Markdown conversion rules.
  - Feishu API wrapper functions and data transformation logic.
- **Integration over Coverage:** No hard code coverage metric (e.g., >80%). Instead, prioritize **Integration Tests** that verify the full "Scrape URL -> Save Markdown -> Download Images" flow.
- **Smoke Testing:** Ensure the scraping engine (Playwright) successfully launches and navigates pages.

## Commit Pattern
- **Atomic Commits:** A commit is mandatory after the completion and verification of each sub-task.
- **Conventional Commits:** All commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
  - `feat: ...` for new features
  - `fix: ...` for bug fixes
  - `refactor: ...` for code restructuring
  - `chore: ...` for maintenance tasks
- **No Git Notes:** Task summaries should be self-evident in the commit message body.

## Verification Protocol
- **MVP Validation:** For Phase 1, manually verify the generated Markdown format (headers, images, links) against the original article before proceeding to cloud sync features.

## Database & Deployment
- **Schema Management:** Run automatic Prisma migration checks (`npx prisma migrate dev`) whenever the SQLite schema (`schema.prisma`) is modified.

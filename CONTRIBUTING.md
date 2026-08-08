# Contributing to CV ATS Pipeline

## Prerequisites

- Node.js >= 20

## Setup steps

1. Clone the repository: `git clone https://github.com/Carmine12328/cv-ats-pipeline.git`
2. Install dependencies: `npm install`
3. Install Playwright: `npx playwright install chromium`

## Development workflow

- Edit the CV data in `data/cv.yaml`
- Run the build process: `npm run build`
- Check the generated files in the `dist/` directory

## ATS constraints to respect

- Single column layout only
- No sidebars
- Text-only skills (no graphics, bars, or charts)
- Use standard fonts

## Commit convention

This project follows conventional commits:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `ci:` continuous integration
- `chore:` maintenance

## How to submit PRs

1. Fork the repository
2. Create a feature branch
3. Commit your changes following the commit convention
4. Open a Pull Request explaining the changes

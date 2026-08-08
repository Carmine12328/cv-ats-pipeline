# Getting Started

Follow these steps to generate your CV for the first time.

## Prerequisites

- **Node.js**: You need Node.js installed (version 18 or higher).

## Installation

1. Clone or download the repository.
2. Open your terminal and navigate to the project directory.
3. Install the required Node.js packages:

```bash
npm install
```

4. Since the project uses Playwright to generate the PDF via a headless browser, you also need to install the Chromium browser binary:

```bash
npx playwright install chromium
```

## Building the CV

To generate your CV from the `data/cv.yaml` file, simply run:

```bash
npm run build
```

_(You can also use `npm run build:pdf` which does the exact same thing)_

## Outputs

After running the build script, check the `dist/` folder. You will find:

- `cv.pdf`: The final PDF to attach to job applications.
- `cv.html`: An HTML version you can preview in your browser.
- `cv.txt`: A plain text version. When a portal asks you to "Paste your resume here", copy the contents of this file!

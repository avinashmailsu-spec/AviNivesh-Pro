![AviNivesh Pro 2.0](docs/assets/github-banner.svg)

# AviNivesh Pro 2.0

**A premium Indian-market wealth research and financial planning application.**  
**Developed by Avinash Ekka**

Avi = Avinash · Nivesh = investment.

AviNivesh Pro combines stock market monitoring, portfolio analytics, mutual-fund research, financial goal planning, risk scenarios and educational AI-style research in a responsive React/Node.js application.

> **Important:** Educational and research software, **not** a SEBI-registered investment adviser or trading platform. This repository does not include live brokerage credentials or paid market-data access. Price quotes may be delayed or use explicitly labelled demo data. No automatic trading or personalised buy/sell recommendations are provided.

## Features

| Markets and analysis | Investing and planning | Experience and reports |
| --- | --- | --- |
| NSE/market quote dashboard | Multi-asset portfolio tracker | Dark/light premium UI |
| Authenticated Upstox snapshots (optional) | XIRR, allocation and rebalancing | Mobile responsive + PWA |
| Upstox V3 streaming connector (optional) | AMFI mutual fund NAV tracking | Heatmaps, charts and visual analytics |
| Price history, candlesticks, heatmap | SIP, retirement and goal projections | Alerts while the app is open |
| Stock screener and research | Scenario stress tests + tax illustrations | PDF, XLSX, CSV, JSON and PNG exports |
| Source/freshness badges | Risk questionnaire and models | Optional educational AI research chat |

## Run locally

**Prerequisites:** Node.js **20+**, npm, and internet access for the initial dependency download.

```bash
# Inside this repository:
cp .env.example .env        # macOS / Linux
# On Windows PowerShell use: Copy-Item .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**. The web app runs on port 5173, and its API runs on port 8787 (both localhost by default). On Windows, you can instead double-click `start-windows.bat` to install dependencies and launch the app.

**No Upstox account is required to explore the UI.** In `.env`, set `DATA_MODE=demo` for explicitly labelled sample data. For authenticated provider quotes, follow [data-source setup](docs/APP_GUIDE.md#configure-optional-services).

### Tests and build

```bash
npm run check
npm test
npm run build
npm start
```

After building, open **http://localhost:8787**. `npm run check` runs dependency-free repository and JavaScript syntax checks; `npm test` runs the existing 25 Node.js tests; `npm run build` compiles the React interface. GitHub Actions repeats these checks after you upload the source.

> **Build verification:** Unit tests and source-level checks were run in the packaging environment. npm registry access was unavailable there, so a complete local Vite build was not verified. The first GitHub Actions CI run should confirm that dependency installation and the production build succeed on GitHub.

## Configuration and data privacy

- Copy `.env.example` to `.env` and add provider credentials **only locally**. `.env` and common secret-key files are ignored by Git.
- `UPSTOX_ACCESS_TOKEN` enables provider calls when authorised. `UPSTOX_STREAM=true` enables the opt-in WebSocket connection if your account has the appropriate entitlement and market-data rights.
- `OPENAI_API_KEY` enables optional server-side research explanations. The built-in educational assistant works without a key.
- `ENABLE_BROKER_IMPORT=true` permits an explicit read-only import from your own Upstox account; it remains off by default.
- Holdings, goals and saved preferences reside primarily in your browser's local storage. Exported reports and backups can contain personal financial information; store them securely.
- **Do not deploy this localhost-focused backend as an unauthenticated public service.** It requires access controls, user authentication, secret management, privacy review and appropriate data licences before a public launch.

For provider conditions, data accuracy, feature limitations, and architecture, see the **[Full Application Guide](docs/APP_GUIDE.md)**. For vulnerability reporting, read [SECURITY.md](SECURITY.md).

## GitHub upload

See **[GITHUB_UPLOAD_GUIDE.md](GITHUB_UPLOAD_GUIDE.md)** for the web upload, GitHub Desktop, and Git command-line methods. Upload the **contents of this repository folder** rather than the `.zip` itself; GitHub will then display the README and run its checks.

### Suggested repository details

- **Name:** `avinivesh-pro`
- **Description:** `AviNivesh Pro 2.0 | Indian market intelligence, portfolio analytics, financial planning and premium dashboards. Developed by Avinash Ekka.`
- **Topics:** `india`, `stock-market`, `investment`, `finance`, `portfolio-tracker`, `react`, `nodejs`, `fintech`, `nse`, `financial-planning`

## Project structure

```text
src/                 React application, financial calculations, premium themes
server/              Express API, market feeds, mutual funds and broker adapters
public/              App icons, original artwork and PWA assets
tests/               Automated Node.js unit tests
docs/                Full application guide and design assets
.github/workflows/   GitHub Actions CI
.env.example         Safe example for optional runtime variables
start-windows.bat     One-step Windows launcher
```

## Open-source licensing

**No open-source license has been selected or granted in this repository package.** The author retains their rights by default. If you intend others to reuse, modify and redistribute the code, choose and add an appropriate `LICENSE` file first. See [GitHub's licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

---

**AviNivesh Pro 2.0 — Developed by Avinash Ekka**

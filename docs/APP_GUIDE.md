# AviNivesh Pro 2.0

**Indian Wealth Intelligence Platform — Developed by Avinash Ekka**

A local-first, premium full-stack investment research, multi-asset tracking, Indian-market monitoring, financial planning and educational analytics app. Avi = Avinash; Nivesh = investment.

> **Scope / disclaimer.** This is a substantial working application source package, not a fully deployed regulated multi-user financial advisory service. It does not execute trades, obtain bank credentials, recommend individual securities or guarantee returns. Some modules require external access, licences, or data supplied by the user. Features unavailable without credentials are clearly identified.

## Start in Windows

1. Install [Node.js 20+](https://nodejs.org/).
2. Extract the latest release or clone the GitHub repository.
3. Double-click **`start-windows.bat`**. It runs `npm install` if dependencies are missing, copies `.env.example` into `.env`, and launches the backend + Vite frontend.
4. Open **http://localhost:5173**.
5. In **My Portfolio**, replace/remove the sample holdings; sample records are never your actual portfolio.

Or using PowerShell:

```powershell
cd AviNivesh_Pro
copy .env.example .env
npm install
npm run dev
```

For a production-style local build:

```bash
npm test
npm run build
npm start
# browser -> http://localhost:8787
```

**Internet is needed for the first npm installation and for actual market/NAV data.** Without a valid data provider the app explicitly displays sample prices or unavailable information. On the source packaging environment, the npm registry was unreachable; the browser production build was not verified there. The GitHub Actions workflow runs install, tests and a production build on each push and pull request.

## Features in Pro 2.0

| Module | Implemented interactions |
|---|---|
| **Overview & Pro command deck** | Original brand illustrations, attractive gradient/animated shortcut tiles, quick market overview; connects to modules |
| **Pro Terminal** | NSE quote tracking, authenticated WebSocket V3 tick support (if enabled), SSE browser updates, OHLC chart, heatmap, breadth, movers, sector filtering, source/freshness labels |
| **Markets (original)** | Quote comparison, old graphs, on-demand NSE ticker addition, watchlists, stock detail drawer |
| **Stock Screener** | Sector, name, price-change filters, sort, SMA20/SMA50, optional user-supplied fundamentals CSV or authorized Upstox key ratios |
| **Portfolio 360°** | Stocks plus manual mutual funds, fixed income, gold, PPF/EPF/NPS, property, cash, allocation graphics, cost comparisons, cash-flow XIRR, rebalancing target scenario |
| **My Portfolio (original)** | Holdings CRUD, local storage and CSV exports |
| **Mutual Funds** | Official AMFI daily NAV search when the network works, user fund-unit tracking, CSV export, optional read-only Upstox MF import, fee-drag illustration |
| **Wealth Planner (original)** | SIP, step-up SIP, lump sum, inflation, goal scenarios |
| **Goals Lab** | Goal target with inflation, projected SIP funding, saved milestones, return assumption charts, deterministic Monte Carlo illustrative ranges, retirement corpus projection |
| **Risk Studio (original)** | Risk questionnaire and illustrative profile |
| **Risk Lab** | Multi-asset stress scenario, concentration analytics, price-history volatility/drawdown, descriptive radar and risk breakdown visuals |
| **Tax Studio** | User-configured financial year, asset class, holding period, gain/exemption/set-off/rate/cess/surcharge scenario and CSV export; **not an automatic statutory tax calculator** |
| **Avi Research** | Interactive educational Q&A, optional server-side OpenAI Responses API, saved browser chat, explicit provider mode and limitations |
| **Smart Alerts** | Price crossings from available non-demo quotes/ticks, stored alert events and optional local browser notifications **while app is open** |
| **Reports** | CSV, JSON profile/data backup, printable HTML, PDF via jsPDF, XLSX via ExcelJS, PNG summary card |
| **Learn & Taxes (original)** | India-specific financial education and links to authoritative sources |
| **Pro Settings** | Dark/light themes, reduced-motion controls, Hindi/English navigation labels, backup/restore and feed diagnostics |
| **PWA** | Installable manifest/icons and offline application-shell cache, while `/api/*` data is **never** cached as fresh market data |

### Provider data integrity

All quotes carry a **source label**, **last available timestamp** and **sample/delayed status**.

| Data source | What works | Requirements |
|---|---|---|
| Upstox **full quote V3** | Exchange snapshots via official API, refreshed periodically | Set `UPSTOX_ACCESS_TOKEN` |
| Upstox **Market Data Feed V3** | Server-side WebSocket LTPC subscription, Protobuf decode, live tick relay through SSE to frontend | `UPSTOX_STREAM=true`, valid token, provider feed access and exchange licences |
| Upstox **Historical Candle V3** | Authenticated chart candles with OHLCV | Valid developer token |
| Upstox **Fundamentals V2** | Key ratios from company ISIN: P/E, P/B, ROE etc. | Valid token with necessary access; use Screener → Fetch ratios |
| Upstox **holdings V2** | Optional manually initiated read-only NSE stocks and mutual fund imports | `ENABLE_BROKER_IMPORT=true` + a token for your **own** account; local app only |
| Yahoo public chart fallback | Historical closes, daily volumes, best-effort public market snapshot | Internet; may be delayed or blocked; not licensed exchange streaming |
| AMFI official NAVAll | Latest published fund NAVs, cached server side for an hour | Internet; end-of-day NAV, **not real-time** |
| Seeded samples | Reproducible demo data for offline evaluation | Clearly marked SAMPLE DATA; never valid for trade execution |

**Provider limitation:** Real tick-by-tick data is not available merely by installing the app. The token, entitlements, current market session and permitted quote use all matter. The V3 WebSocket connector uses a minimal, documented Protobuf-compatible schema for LTPC updates, with reconnection/backoff and feed status. Connection cannot be tested without real credentials. Upstox tokens typically expire and require renewal; automatic user OAuth is NOT included.

### Configure optional services

After extracting, edit your local **`.env`**, never share it or commit it to GitHub:

```dotenv
DATA_MODE=public
API_PORT=8787
UPSTOX_ACCESS_TOKEN=your_personal_developer_token
UPSTOX_STREAM=true
ENABLE_BROKER_IMPORT=false
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

- To test without online providers use `DATA_MODE=demo`. All sample numbers are labelled.
- To use **broker read-only import**, set `ENABLE_BROKER_IMPORT=true` and ensure a token is associated with your own account and includes required permissions. The import occurs only after explicit user action; the local server rejects direct non-loopback clients. The frontend and backend bind to `127.0.0.1` by default. **Never expose this local server through public ports or an unauthenticated reverse proxy.**
- An `OPENAI_API_KEY` enables optional generative explanations. The browser sends the question to the local server; the server sends the question and only relevant source-labelled quote context to the configured AI provider. **Saved holdings, account tokens, risk answers and local goals are not included in AI requests.** If the AI provider is unavailable, research falls back to the built-in deterministic educational engine.
- Portfolio storage uses browser `localStorage`. Account aggregation, server-side user accounts, automatic OAuth refresh, encrypted cloud profiles, compliant robo-advice, live news, SMS/email push delivery and multi-user collaboration **are not present**. Those require further identity/security infrastructure, commercial licences or regulatory work. The UI explains these limitations instead of pretending a connection exists.

## Data-file formats

**Import stock holdings**: `symbol,qty,avg,sector`. Add any missing symbols in Markets first; imported rows must match tracked NSE symbols. Validate duplicate lots after importing.

**Import optional company financial ratios**: `symbol,pe,pb,roe,debt_equity,source,asof`; values are labelled as user-entered. The Upstox key-ratios button can import provider data for an instrument when authorized.

**Export:** PDF and Excel require the project dependencies to install. Generated PDF is a basic portable summary; the HTML variant includes cleaner tables for browser printing. Exported JSON and CSV contain potentially sensitive financial information and are **not encrypted**.

## Suggested technical evolution before public launch

1. Exchange market-data contracts and compliant redistribution permissions; provider licensing/availability checks.
2. Identity/consent, secure credential management, OAuth refresh, encrypted PostgreSQL storage, audit logs, OWASP controls and privacy/legal review.
3. Fully licensed data services for corporate actions, official financial statements and historical adjusted total returns.
4. Background alerting with an opted-in notification provider; job queues and monitored service workers.
5. Automated integration/browser tests, CI pipeline, containerized reproducible builds and mobile app-store distribution.
6. If issuing regulated personalized recommendations, obtain the necessary SEBI authorization and qualified compliance review; this educational app itself is **not** a SEBI-registered investment adviser.

## Architecture

```
AviNivesh_Pro/
 ├── src/
 │   ├── App.jsx            Original modules + upgraded navigation
 │   ├── ProModules.jsx     New 2.0 interactive workspace modules
 │   ├── analytics.js       Pure mathematics, models and CSV utilities
 │   ├── finance.js         Original SIP / risk / portfolio calculations
 │   ├── styles.css         Original visual theme
 │   ├── proStyles.css      New original premium responsive themes
 │   └── main.jsx           React mount / PWA registration
 ├── server/
 │   ├── index.js           Express API + optional AI / integration routes
 │   ├── market.js          Quotes / public fallback / historical data
 │   ├── catalog.js         Curated and dynamic NSE symbol index
 │   ├── funds.js           AMFI parser / daily NAV feed
 │   ├── fundamentals.js    Authenticated key-ratio connector
 │   ├── broker.js          Explicit local-only, read-only holdings import
 │   ├── stream.js          Authenticated V3 feed / SSE relay
 │   └── proto/             Minimal LTPC wire definitions
 ├── public/               Brand icons, original SVG art, PWA files
 ├── tests/                Node's built-in test runner
 ├── .env.example
 ├── start-windows.bat
 └── README.md
```

**Testing:** `npm test` runs calculations, market fallback integrity, AMFI parsing and read-only import mapping. `node --check` verifies backend JavaScript and the authored JSX is source-syntax checked. The source packaging environment could not reach the npm registry; GitHub Actions will run a full build after upload, but full browser end-to-end tests are not yet included.

## Authoritative resources

- [Upstox Market Data Feed V3](https://upstox.com/developer/api-documentation/v3/get-market-data-feed/)
- [Upstox Full Market Quotes V3](https://upstox.com/developer/api-documentation/get-full-market-quote-v3/)
- [Upstox Key Financial Ratios API](https://upstox.com/developer/api-documentation/get-key-ratios/)
- [Upstox Read Holdings](https://upstox.com/developer/api-documentation/get-holdings/)
- [AMFI Official NAV Download](https://www.amfiindia.com/net-asset-value/nav-download)
- [SEBI Investor Portal: Registered Investment Advisers](https://investor.sebi.gov.in/investment_advisor.html)

---

**AviNivesh Pro 2.0 · Developed by Avinash Ekka**

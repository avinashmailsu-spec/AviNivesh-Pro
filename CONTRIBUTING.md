# Contributing to AviNivesh Pro

Thanks for your interest in improving AviNivesh Pro 2.0 — Developed by Avinash Ekka.

Please start by opening an issue describing the desired change and intended user benefit before submitting a significant new feature. For bug reports, include a minimal reproduction, browser/Node.js version, expected behaviour, and actual behaviour. **Never attach personal portfolio exports, credentials, or confidential market data.**

## Development checks

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env` and use `DATA_MODE=demo` when developing without provider credentials.
3. Run `npm run dev` for local frontend and backend development.
4. Before submitting a pull request, run `npm run check`, `npm test`, and `npm run build`.
5. Explain any new external data sources, their licensing, any new secrets, their privacy impact, and failure behaviour.

Favor accessible, responsive visualisations and source-labelled numerical information. Never present sample, delayed, or unverified numbers as live market quotes. Avoid personalized investment recommendations and promises of returns.

## License and usage rights

This package does not currently include an open-source license. Opening issues and making pull requests does not by itself change copyright and licensing terms. The repository owner should explicitly choose a license before inviting broad reuse or redistribution.

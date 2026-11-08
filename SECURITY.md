# Security policy

AviNivesh Pro 2.0 is currently intended for **local, personal, educational research** use. It has **not** undergone an independent production security audit and is **not ready for public, multi-tenant deployment** without significant additional safeguards.

## Reporting a vulnerability

**Do not disclose live secrets, financial account information, or exploit details in a public GitHub issue.** If the repository owner enables GitHub private vulnerability reporting, use that. Otherwise, ask the maintainer through a non-sensitive issue for a private reporting channel (without providing vulnerability details in the issue).

## Critical protections

- Never commit `.env`, tokens, API keys, broker credentials, personal backups, or downloaded investor reports.
- Keep `ENABLE_BROKER_IMPORT=false` unless you deliberately need read-only import for your own local account.
- Backend is bound to loopback (`127.0.0.1`) by default; **do not bypass this with a public port or open reverse proxy**.
- Do not publish market feed data unless your exchange/provider agreement expressly permits display and redistribution.
- Local browser storage is not encrypted; use a protected user profile and avoid public/shared computers for real holdings.
- Before production deployment, implement authentication, authorization, rate limits, CSRF/CORS review, secret management, account isolation, data privacy controls, safe logging, current dependency scanning and an independent security audit.
- Assess the optional AI provider integration for user notice, consent and data handling requirements.
- GitHub Pages will not run the backend; deploying only the static frontend will not provide the integrated API.

## Supported versions

Only the latest release is intended for maintenance. The source is provided for educational and local use, with no guaranteed security response SLA.

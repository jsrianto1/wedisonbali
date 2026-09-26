# Wedison Bali

Public consumer website for Wedison Bali, in Indonesian and English.

## Hostinger GitHub deployment

- Repository: jsrianto1/wedisonbali
- Branch: main
- Root directory: repository root
- Framework: Other (Node.js server)
- Node version: 22 or 24
- Build command: npm run build
- Output directory: dist
- Entry file: server.js (inside the output directory)
- Start command if requested: npm start

The server binds to 0.0.0.0 and uses the PORT assigned by Hostinger. No runtime dependencies, API keys, database or secrets are needed. The server serves only public/ and supports video byte ranges. It does not expose this README, repository files or server source.

## Local preview

npm start

Default port: 4173. Optional PORT and HOST environment variables can override the defaults.

## Content updates

The editable generator project remains in the local wedison-bali-site workspace. Build and validate there, sync its public/ directory here, then commit and push. Do not add internal commercial documents or credentials.

Hostinger guide: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/

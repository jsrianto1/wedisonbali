# Wedison Bali

Deployment repository for the Wedison Bali consumer website.

The repository root contains the ready-to-serve static website. No build command, runtime dependencies, API keys or database are required.

## Hostinger Git deployment

For a custom HTML website, connect this repository in the website dashboard under Advanced > Git. Deploy the main branch to the website document root, normally public_html. index.html must be at that root.

The website has 20 Indonesian and English pages, local assets, consumer OTR prices, BAAS information and WhatsApp inquiries. Internal commercial documents and local QA files are excluded.

## Updating

The editable generator project remains in the local wedison-bali-site workspace. Build and validate there, then sync its public directory to this repository and commit the public output. Do not add source business documents or credentials.

Deployment guide: https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/

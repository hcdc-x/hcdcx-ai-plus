# Security Policy

## Reporting a Vulnerability

Please email **contact.hcdcx@gmail.com**. Do not open public issues. We aim to respond within 48 hours.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅         |

## Security Features

- **JWT** with 15-minute access tokens and refresh rotation
- **TOTP** two-factor authentication
- **Bcrypt** password hashing
- **Zero-trust** risk scoring (0-100) per scan
- **Helmet.js** security headers
- **Rate limiting** on auth and generation endpoints
- **MongoDB Atlas** encryption at rest
- **Cloudinary** signed uploads

## Best Practices for Self-Hosting

1. Never commit `.env` files
2. Use strong JWT secrets (64+ random chars)
3. Restrict MongoDB Atlas IP access list
4. Enable Supabase Row Level Security
5. Use HTTPS everywhere (Netlify/Railway enforce this)
6. Keep dependencies updated (`pnpm update`, `npm audit`)

## Vulnerability Disclosure

We follow responsible disclosure. Reporters will be credited in release notes unless anonymity is requested.

# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The HCDC-X team takes security issues seriously. We appreciate your efforts to responsibly disclose your findings.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, send an email to **[contact.hcdcx@gmail.com](mailto:contact.hcdcx@gmail.com)**.

You should receive a response within **48 hours**. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

We prefer all communications to be in **English**.

## Security Response Process

1. The security team will acknowledge receipt of your report within 48 hours.
2. We will investigate the issue and determine its impact and severity.
3. If the issue is confirmed, we will develop a fix and release a patch as soon as possible, depending on complexity.
4. We will credit the reporter in the release notes (unless you prefer to remain anonymous).

## Security Features of HCDC-X AI+

Our platform is built with a **zero-trust security model** and includes several layers of protection:

### Authentication & Authorization
- **JWT** with short-lived access tokens (15 minutes) and refresh token rotation.
- **TOTP (Time-based One-Time Password)** support for two-factor authentication (RFC 6238).
- Bcrypt password hashing with salt rounds.
- Role-based access control (RBAC).

### Code Security
- **Anti-counterfeit detection** – RGB color layer checksums prevent code tampering.
- **Dynamic time-based codes** – Codes expire after 5–30 seconds to prevent replay attacks.
- **Token-based validation** – Each scan verifies a cryptographic signature.

### AI-Powered Threat Detection
- **Real-time risk scoring (0–100)** based on behavioral analysis, device fingerprinting, geolocation, and scan velocity.
- Automatic actions: `allow`, `limit`, or `block` based on risk threshold.
- **Isolation Forest** and **LSTM** models for anomaly detection (optional integration).

### Infrastructure Security
- **Helmet.js** for securing HTTP headers.
- **Rate limiting** on API endpoints.
- **CORS** properly configured.
- All secrets managed via environment variables.
- **MongoDB Atlas** network isolation and encryption at rest.
- **Cloudinary** signed uploads to prevent abuse.

## Security Best Practices for Self-Hosting

If you are deploying HCDC-X AI+ on your own infrastructure:

1. **Never commit `.env` files**. Always use environment variables for secrets.
2. Use a **strong JWT secret** (64+ random characters). Generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Enable **MongoDB Atlas network access** restrictions (allowlist only your server IP).
4. Set up **Supabase Row Level Security (RLS)** policies for file access.
5. Enable **Redis AUTH** password if using a Redis instance.
6. Keep all dependencies updated regularly (`npm audit`, `pnpm update`).
7. Use **HTTPS** everywhere (enforced by Netlify/Railway automatically).

## Vulnerability Disclosure Hall of Fame

We thank the following individuals for responsibly disclosing security issues:

*This list will be updated as contributions are received.*

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Zero Trust Architecture (NIST SP 800-207)](https://csrc.nist.gov/publications/detail/sp/800-207/final)

---

**Security is a shared responsibility.** Thank you for helping keep HCDC-X AI+ and its users safe.

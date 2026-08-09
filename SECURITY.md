# 🔒 Security Guidelines - Sands Club

## Overview

This document outlines security best practices for running Sands Club in production. Follow these guidelines to protect user data, financial transactions, and system integrity.

## Environment Variables & Secrets

### ✅ DO
- Store all secrets in `.env.local` (local development)
- Use Base44 environment variables for production
- Rotate credentials regularly
- Use different keys for dev/staging/production
- Never commit `.env.local` to version control
- Use strong, unique passwords for all services

### ❌ DON'T
- Hardcode API keys, tokens, or passwords in code
- Commit secrets to Git
- Share `.env.local` files
- Use same credentials across environments
- Log sensitive data
- Expose error messages with system details

## Authentication & Authorization

### Password Security
```javascript
// ✅ Good: Use auth service
const { login } = useAuth();
await login(email, password);

// Server-side hashing (handled by Base44)
// Never transmit passwords in plain text
```

### Session Management
```env
# Session timeout (1 hour = 3600000ms)
VITE_SESSION_TIMEOUT=3600000
```

### API Authentication
- All API calls must include authentication token
- Tokens should expire and refresh automatically
- Implement logout on 401 Unauthorized
- Clear sensitive data from memory on logout

## Data Protection

### Database
- Use encrypted connections (SSL/TLS)
- Implement row-level security
- Encrypt sensitive fields at rest
- Regular backups with encryption
- Audit logging for sensitive operations

### User Data
- Hash passwords with bcrypt (minimum 10 rounds)
- Never store payment card data (use Stripe)
- Minimize PII collection
- GDPR compliant data retention
- Implement data deletion for user requests

### Financial Data
- Never store full card numbers
- Always use Stripe for payments
- PCI DSS compliance
- Audit all financial transactions
- Secure transaction logging

## API Security

### Rate Limiting
```
# Configure on Base44
- 1000 requests/hour per IP
- 100 requests/minute per user
- Gradual backoff on limits
```

### Input Validation
```javascript
// ✅ Always validate & sanitize input
import { z } from 'zod';

const BetSchema = z.object({
  gameId: z.string().uuid(),
  amount: z.number().positive().max(10000),
  selections: z.array(z.number()).min(1).max(10)
});

const bet = BetSchema.parse(userInput);
```

### CORS Configuration
```javascript
// Configure in Base44
// Only allow trusted domains
// Use credentials: 'include' only for same-origin
```

## HTTPS & TLS

### ✅ Requirements
- Force HTTPS everywhere
- Minimum TLS 1.2
- Strong cipher suites
- Valid SSL certificates (auto-renewed by Base44)
- HSTS headers enabled

## Error Handling

### ✅ Production Error Handling
```javascript
try {
  // API call
} catch (error) {
  // Log to Sentry
  Sentry.captureException(error);
  
  // Show generic message to user
  toast.error('An error occurred. Please try again.');
  
  // Log detailed error internally (not to user)
  console.error('DEBUG:', error);
}
```

### ❌ Avoid
- Showing full error messages to users
- Logging sensitive data (passwords, tokens, PII)
- Exposing stack traces in API responses
- Revealing system details or technologies

## Third-Party Integrations

### Stripe
- Use Stripe Elements for card handling
- Never access raw card data
- Implement webhook verification
- Monitor for fraudulent transactions
- PCI compliance handled by Stripe

### Sentry
- Only send non-sensitive error data
- Configure allowUrls for valid domains
- Use environment context
- Don't capture user passwords or tokens
- Regular DSN rotation

### Google Analytics
- Anonymous user tracking only
- Disable tracking in development
- Respect user privacy settings
- GDPR-compliant data retention
- No PII in custom dimensions

## Dependency Security

### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Review breaking changes
npm outdated
```

### Trusted Dependencies Only
- Review `package.json` for unnecessary packages
- Check vulnerability history
- Monitor for abandoned packages
- Use npm audit for automated checks

## Code Security

### Input Validation
```javascript
// ✅ Always validate
const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potentially harmful chars
    .slice(0, 255); // Limit length
};
```

### XSS Prevention
```javascript
// ✅ React automatically escapes
<div>{userInput}</div> // Safe

// ❌ Avoid
<div dangerouslySetInnerHTML={{__html: userInput}} /> // Unsafe
```

### CSRF Protection
- Base44 handles CSRF tokens automatically
- Always use authenticated API calls
- Verify origin on sensitive operations

## Logging & Monitoring

### What to Log
- Authentication attempts (failed logins)
- API errors and exceptions
- Unusual access patterns
- Deployment events
- Payment events (not card data)

### What NOT to Log
- User passwords
- Authentication tokens
- API keys or secrets
- Full credit card numbers
- Personally identifiable information (PII)

### Monitoring Setup
```env
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ENABLED=true
VITE_LOG_LEVEL=warn  # Production level
```

## Deployment Security

### Pre-Deployment Checklist
- [ ] All secrets removed from code
- [ ] Environment variables configured
- [ ] Dependencies audited
- [ ] SSL certificates valid
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error monitoring configured

### Post-Deployment
- [ ] SSL certificate chain verified
- [ ] Security headers present
- [ ] API endpoints responding
- [ ] Error logging working
- [ ] Analytics tracking
- [ ] Database backups enabled
- [ ] Monitoring alerts active

## Incident Response

### If Compromised
1. Immediately revoke all tokens
2. Reset admin passwords
3. Review access logs
4. Notify affected users
5. Rotate encryption keys
6. Deploy security patches
7. Conduct post-mortem

### Contact
- Security Issues: Report privately to maintainers
- Base44 Support: https://app.base44.com/support
- Stripe Security: https://stripe.com/docs/security

## Compliance

### GDPR
- User consent for data collection
- Right to access user data
- Right to delete user data
- Data portability
- Privacy policy

### PCI DSS (Payment Card Industry)
- Handled by Stripe (outsource card handling)
- Secure API communication
- Regular security audits
- Vulnerability scanning

### CCPA (California Consumer Privacy Act)
- Transparent data practices
- User data deletion capability
- Opt-out mechanisms
- Privacy disclosures

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Base44 Security Docs](https://docs.base44.com/security)
- [Stripe Security](https://stripe.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

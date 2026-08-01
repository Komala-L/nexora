> This document describes the JSON Web Token (JWT) authentication mechanism implemented by Nexora.
> It explains the design decisions, token structure, verification process, and security principles used for stateless user authentication.

# JWT Authentication

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Authentication |
| Document Type | Security Design |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 1 August 2026 |

---

## Implementation Location

| Component | Location |
|----------|----------|
| User Model | `src/models/user.model.js` |
| JWT Generation | `src/models/user.model.js` |
| Authentication Middleware | `src/middleware/auth.middleware.js` |
| Authentication Controller | `src/controllers/auth.controller.js` |
| Environment Configuration | `.env` |

---

# 1. Overview

Nexora uses JSON Web Tokens (JWT) to authenticate users and authorize access to protected resources.

JWT enables stateless authentication by allowing the server to verify user identity without maintaining server-side sessions.

Once a user successfully logs in, the server issues a signed JWT access token that accompanies future authenticated requests.

---

# 2. Objectives

The JWT authentication mechanism is designed to:

- Provide stateless authentication.
- Secure protected API endpoints.
- Eliminate server-side session storage.
- Improve application scalability.
- Minimize database lookups for authenticated requests.
- Support secure token-based authorization.

---

# 3. Why JWT?

JSON Web Token (JWT) is an industry-standard authentication mechanism defined by RFC 7519.

Nexora uses JWT because it provides:

- Stateless authentication.
- High scalability.
- Cross-platform compatibility.
- Compact token representation.
- Cryptographic signature verification.
- Wide ecosystem support.

JWT allows authenticated requests to be verified without requiring session storage on the server.

---

# 4. Token Structure

A JWT consists of three Base64URL-encoded components separated by periods.

```
Header.Payload.Signature
```

### Header

Contains metadata describing the token.

Example:

```json
{
    "alg": "HS256",
    "typ": "JWT"
}
```

---

### Payload

Contains application-specific claims.

Current payload:

```json
{
    "_id": "USER_ID"
}
```

Only the minimum required information is included.

Sensitive information is intentionally excluded.

---

### Signature

The signature guarantees token integrity.

It is generated using:

- Header
- Payload
- JWT Secret

If any part of the token is modified, signature verification fails.

---

# 5. Access Token

Access tokens represent authenticated user sessions.

Characteristics:

- Short-lived
- Signed using JWT
- Stored inside secure HTTP-only cookies
- Sent automatically with authenticated requests

The access token contains only the user's unique identifier.

Additional claims may be introduced as future application requirements evolve.

---

# 6. JWT Generation

JWT access tokens are generated through a User model method.

```js
generateAccessToken()
```

The method:

- Signs the token.
- Embeds the authenticated user's identifier.
- Uses the configured secret.
- Applies the configured expiration time.

Centralizing token generation inside the model ensures consistent authentication behavior throughout the application.

---

# 7. Token Verification

Incoming access tokens are verified by the authentication middleware.

Verification includes:

1. Reading the access token from cookies.
2. Verifying the token signature.
3. Decoding the payload.
4. Retrieving the authenticated user from the database.
5. Attaching the user to the request object.

Only successfully verified tokens may access protected resources.

---

# 8. Authentication Middleware

The authentication middleware acts as the application's authorization gate.

Responsibilities include:

- Extract JWT.
- Verify signature.
- Validate expiration.
- Retrieve authenticated user.
- Reject unauthorized requests.

Successful verification attaches:

```js
req.user
```

to the request lifecycle.

---

# 9. Token Expiration

Access tokens are intentionally configured with a limited lifetime.

Current configuration:

```env
JWT_ACCESS_TOKEN_EXPIRY=1d
```

A limited lifetime reduces the impact of token leakage while allowing authenticated users to access protected resources without repeatedly submitting credentials.

Expired access tokens must be replaced using the refresh token workflow.

---

# 10. Configuration

JWT authentication depends on the following environment variables.

```env
JWT_ACCESS_SECRET=your_secret_key

JWT_ACCESS_TOKEN_EXPIRY=1d
```

The signing secret should never be committed to source control.

Production deployments should use long, cryptographically secure secrets.

---

# 11. Assumptions

The current implementation assumes:

- All production traffic is served over HTTPS.
- JWT secrets remain confidential.
- Tokens are signed using HS256.
- Authentication cookies are transmitted securely.
- Access tokens remain short-lived.

---

# 12. Security Considerations

The JWT implementation follows these security principles:

- Tokens are cryptographically signed.
- Token integrity is verified before every protected request.
- Access tokens contain only minimal user information.
- Secrets are stored in environment variables.
- Authentication relies on HTTP-only cookies rather than client-side storage.
- Expired tokens cannot access protected resources.

---

# 13. Known Risks

JWT authentication intentionally accepts the following limitations during the current development phase:

- Access tokens remain valid until expiration unless additional token revocation mechanisms are introduced.
- Token blacklisting has not been implemented.
- Device-specific authentication is not yet supported.
- Session management is handled through refresh tokens rather than server-side sessions.

These limitations are acceptable for the current application stage.

---

# 14. Future Improvements

Future authentication enhancements may include:

- JWT key rotation.
- Multiple signing algorithms.
- Device-specific sessions.
- Session revocation.
- Token blacklisting.
- User roles within JWT claims.
- Permission-based authorization.
- Distributed secret management.

---

# 15. Out of Scope

This document intentionally does not cover:

- Password hashing.
- Refresh token architecture.
- Authorization.
- OAuth providers.
- Multi-factor authentication.

These topics are documented in their respective documents within the `docs/authentication/` directory.

---

# 16. Design Decisions

## Why use stateless authentication?

Stateless authentication improves scalability because the server does not maintain user session state.

Every request carries the information required for authentication.

---

## Why include only the user ID?

JWT payloads should remain minimal.

Including only the authenticated user's identifier:

- Reduces token size.
- Minimizes information exposure.
- Ensures fresh user information is always retrieved from the database.

---

## Why use HTTP-only cookies?

Storing JWTs inside HTTP-only cookies reduces exposure to client-side JavaScript and helps mitigate XSS attacks.

---

## Why use environment variables?

JWT secrets represent highly sensitive cryptographic material.

Keeping secrets outside the application source code improves deployment security and simplifies secret rotation.

---

# 17. Related Documents

The following documents complement this design.

- Authentication Module Overview
- Password Hashing
- Refresh Token
- Authentication Security Best Practices

---

# 18. References

- RFC 7519 — JSON Web Token (JWT)
- OWASP JSON Web Token Cheat Sheet
- OWASP Authentication Cheat Sheet
- jsonwebtoken (Node.js) Documentation
- Express.js Documentation

---

# 19. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial JWT Authentication Design |
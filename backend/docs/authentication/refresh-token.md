> This document describes the refresh token architecture implemented by Nexora.
> It explains the design decisions, refresh token lifecycle, rotation mechanism, cookie storage strategy, and security principles used to maintain long-lived authenticated sessions.

# Refresh Token

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
| Authentication Controller | `src/controllers/auth.controller.js` |
| Authentication Service | `src/services/auth.service.js` |
| User Model | `src/models/user.model.js` |
| Cookie Configuration | `src/utils/cookieOptions.js` |
| Environment Configuration | `.env` |

---

# 1. Overview

Access tokens are intentionally short-lived to reduce the impact of token leakage.

Requiring users to log in every time an access token expires would significantly reduce usability.

To solve this problem, Nexora implements Refresh Tokens.

Refresh tokens allow authenticated users to obtain new access tokens without resubmitting their credentials, while maintaining strong security through refresh token rotation.

---

# 2. Objectives

The refresh token architecture is designed to:

- Maintain long-lived authenticated sessions.
- Minimize repeated login requests.
- Reduce credential exposure.
- Improve overall user experience.
- Support secure token rotation.
- Allow immediate session invalidation during logout.

---

# 3. Why Refresh Tokens?

Access tokens should remain short-lived.

If an access token expires after a few minutes or hours, requiring users to authenticate repeatedly would create unnecessary friction.

Refresh tokens solve this problem by allowing the server to issue new access tokens after verifying a trusted refresh token.

This approach balances usability and security.

---

# 4. Refresh Token Lifecycle

The refresh token follows the lifecycle below.

```
User Login

↓

Generate Access Token

↓

Generate Refresh Token

↓

Persist Refresh Token in Database

↓

Send Access Token Cookie

↓

Send Refresh Token Cookie

↓

Access Token Expires

↓

Client Calls Refresh Endpoint

↓

Read Refresh Token from HTTP-only Cookie

↓

Verify Refresh Token

↓

Retrieve User from Database

↓

Compare Stored Refresh Token

↓

Generate New Access Token

↓

Generate New Refresh Token

↓

Persist New Refresh Token

↓

Return Updated Authentication Cookies

↓

Continue Authenticated Session
```

---

# 5. Refresh Token Generation

Refresh tokens are generated after successful user authentication.

Generation is centralized within the authentication service.

Responsibilities include:

- Creating a new refresh token.
- Persisting the token in the database.
- Returning the generated token to the controller.

Centralizing generation prevents duplicated authentication logic.

---

# 6. Refresh Token Storage

Nexora stores refresh tokens in two locations.

## Database

The latest refresh token is stored in the authenticated user's document.

Purpose:

- Verify incoming refresh tokens.
- Invalidate sessions during logout.
- Detect invalid or outdated refresh tokens.

---

## HTTP-only Cookie

The refresh token is also stored inside an HTTP-only cookie.

Purpose:

- Automatic transmission with requests.
- Protection against JavaScript access.
- Improved security against XSS attacks.

---

# 7. Refresh Token Rotation

Nexora implements Refresh Token Rotation.

Whenever a refresh request succeeds:

1. Incoming refresh token is verified.
2. Stored refresh token is compared.
3. A new access token is generated.
4. A new refresh token is generated.
5. The previous refresh token is replaced.
6. Updated cookies are returned.

The previous refresh token immediately becomes invalid.

This significantly limits replay attacks.

---

# 8. Refresh Workflow

The refresh endpoint performs the following operations.

1. Read refresh token from cookies.
2. Verify JWT signature.
3. Decode user identifier.
4. Retrieve user from database.
5. Compare stored refresh token.
6. Generate new authentication tokens.
7. Persist the new refresh token.
8. Return updated authentication cookies.

Only valid refresh tokens can generate new access tokens.

---

# 9. Logout Behavior

Logout immediately invalidates the authenticated session.

During logout:

- Database refresh token is removed.
- Access token cookie is cleared.
- Refresh token cookie is cleared.

Future refresh requests using the previous token will fail.

---

# 10. Configuration

Current refresh token configuration:

```env
JWT_REFRESH_SECRET=your_secret_key

JWT_REFRESH_TOKEN_EXPIRY=7d
```

The refresh token lifetime is intentionally longer than the access token lifetime.

---

# 11. Assumptions

The current implementation assumes:

- Refresh tokens remain confidential.
- Cookies are transmitted over HTTPS.
- HTTP-only cookies cannot be accessed by client-side JavaScript.
- The current implementation supports only one active authenticated session per user.

---

# 12. Security Considerations

The refresh token implementation follows these security principles.

- Refresh tokens are stored in HTTP-only cookies.
- Refresh tokens are stored in the database.
- Every successful refresh rotates the token.
- Old refresh tokens immediately become invalid.
- Refresh requests always verify database state.
- Logout invalidates refresh tokens immediately.

---

# 13. Known Risks

The current implementation intentionally accepts the following limitations.

- Only one active session is supported per user.
- Device-specific refresh tokens have not been implemented.
- Refresh token reuse detection has not yet been implemented.
- Session history is not currently maintained.

These limitations are acceptable for the current development phase.

---

# 14. Future Improvements

The refresh token architecture may be extended with:

- Multiple device sessions.
- Refresh token reuse detection.
- Session management dashboard.
- Device identification.
- Refresh token blacklisting.
- Token family tracking.
- Automatic suspicious session detection.

---

# 15. Out of Scope

This document intentionally does not cover:

- Password hashing.
- JWT authentication.
- Authorization.
- OAuth authentication.
- Multi-factor authentication.

These topics are documented in their respective documents within the `docs/authentication/` directory.

---

# 16. Design Decisions

## Why store refresh tokens in the database?

Persisting refresh tokens allows the server to verify active sessions and invalidate them immediately during logout.

---

## Why rotate refresh tokens?

Rotation limits the usefulness of stolen refresh tokens by invalidating the previous token every time authentication is refreshed.

---

## Why store refresh tokens inside HTTP-only cookies?

HTTP-only cookies reduce exposure to client-side JavaScript and improve protection against XSS attacks.

---

## Why separate access and refresh tokens?

Using short-lived access tokens together with long-lived refresh tokens provides an effective balance between security and usability.

---

# 17. Related Documents

The following documents complement this design.

- Authentication Module Overview
- Password Hashing
- JWT Authentication
- Authentication Security Best Practices

---

# 18. References

- RFC 7519 — JSON Web Token (JWT)
- OWASP Session Management Cheat Sheet
- OWASP Authentication Cheat Sheet
- jsonwebtoken (Node.js) Documentation
- Express.js Documentation

---

# 19. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Refresh Token Architecture Design |
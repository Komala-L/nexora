> This document describes the password hashing strategy used by Nexora.
> It explains the design decisions, implementation approach, and security principles used for password storage within the authentication module.

# Password Hashing

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
| Last Updated | 17 July 2026 |

---

## Implementation Location

| Component | Location |
|----------|----------|
| User Model | `src/models/user.model.js` |
| Password Hash Middleware | `src/models/user.model.js` |
| Password Comparison Method | `src/models/user.model.js` |
| Environment Configuration | `.env` |

---

# 1. Overview

Passwords are among the most sensitive pieces of data handled by the application.

Nexora never stores plain-text passwords. Before persistence, every password is transformed into a one-way cryptographic hash using bcrypt. This ensures that the original password cannot be recovered from the stored value, reducing the impact of a potential database compromise.

---

# 2. Objectives

The password hashing mechanism is designed to:

- Never persist plain-text passwords.
- Protect user credentials against database leaks.
- Increase resistance to brute-force attacks.
- Automatically enforce password hashing without relying on controller logic.
- Allow future security improvements through configurable settings.

---

# 3. Why bcrypt?

Nexora uses bcrypt because it is a mature, battle-tested password hashing algorithm specifically designed for password storage.

Key reasons include:

- Intentionally slow to reduce brute-force attack efficiency.
- Automatically generates a unique salt for every password.
- Widely trusted across the Node.js ecosystem.
- Proven reliability in production applications.
- Easy to configure as security requirements evolve.

---

# 4. Why Not SHA-256?

SHA-256 is a general-purpose cryptographic hashing algorithm intended for data integrity rather than password storage.

Because SHA-256 is designed to be extremely fast, modern hardware can perform billions of hash calculations per second, making brute-force attacks significantly more practical.

bcrypt intentionally increases computation time, making password guessing substantially more expensive while remaining fast enough for legitimate users.

---

# 5. Why bcrypt Instead of Argon2?

Argon2 is currently regarded as the state-of-the-art password hashing algorithm and provides stronger protection against specialized hardware attacks.

However, bcrypt was selected for the current version of Nexora because it provides:

- Excellent ecosystem support
- Stable Node.js libraries
- Simpler deployment
- Industry-proven reliability
- Sufficient security for the current application scale

The authentication architecture has been designed so that migrating to Argon2 in a future release would require minimal changes.

---

# 6. Password Hashing Workflow

### Registration Flow

1. User submits a password.
2. Input validation is performed.
3. Mongoose pre-save middleware executes.
4. bcrypt hashes the password.
5. The hashed password is stored in the database.

### Login Flow

1. User submits a password.
2. The stored password hash is retrieved.
3. `comparePassword()` delegates verification to bcrypt.
4. Authentication succeeds only if both values match.

---

# 7. Implementation Strategy

Password hashing is implemented through a Mongoose pre-save middleware.

This design ensures:

- Password hashing is automatically enforced.
- Plain-text passwords cannot be accidentally persisted.
- Security logic remains centralized.
- Every user creation or password update follows the same process.

The middleware hashes the password only when the `password` field has changed, preventing already-hashed passwords from being hashed multiple times.

---

# 8. Password Comparison

Password verification is implemented as a User schema method:

```js
comparePassword()
```

Encapsulating comparison logic within the model improves maintainability, prevents duplication across controllers, and ensures password verification always uses bcrypt.

---

# 9. Configuration

The bcrypt cost factor is configured through an environment variable.

```env
BCRYPT_SALT_ROUNDS=10
```

Using an environment variable allows security requirements to evolve without modifying application code.

The current default value (`10`) provides an appropriate balance between security and application performance for the current version of Nexora.

---

# 10. Assumptions

The current implementation assumes:

- All authentication requests are transmitted over HTTPS.
- Password validation occurs before persistence.
- bcrypt remains the configured password hashing provider.
- Environment variables are securely managed.

---

# 11. Security Considerations

The current implementation follows these security principles:

- Plain-text passwords are never stored.
- Passwords are excluded from queries by default using `select: false`.
- Password hashes are generated automatically before persistence.
- Password verification always uses bcrypt.
- Salt rounds remain configurable through environment variables.

---

# 12. Known Risks

The current authentication implementation intentionally accepts the following limitations:

- Password strength validation is limited to minimum length requirements.
- Password reset functionality has not yet been implemented.
- Account lockout after repeated failed login attempts is not yet available.
- Refresh token support has not yet been introduced.

These limitations are acceptable for the current development phase and will be addressed in future iterations.

---

# 13. Future Improvements

The following authentication capabilities are intentionally deferred:

- Password reset
- Email verification
- Multi-factor authentication (MFA)
- Refresh token rotation
- Password history
- Strong password policy enforcement
- Account lockout policies
- Evaluation of Argon2 migration

---

# 14. Out of Scope

This document intentionally does not cover:

- JWT authentication
- Refresh token architecture
- Authorization
- OAuth providers
- Session management

These topics are documented separately within the Authentication module.

---

# 15. Design Decisions

## Why hash inside the User model?

Password hashing belongs to the persistence layer because it should never depend on controller implementations.

Using Mongoose middleware guarantees that every password is securely hashed regardless of where the User document is created or modified, preventing accidental security bypasses.

---

## Why implement `comparePassword()` as a schema method?

Password comparison represents behavior of the User entity rather than controller logic.

Keeping this functionality inside the model improves encapsulation and avoids duplicate authentication logic across the application.

---

## Why use an environment variable for salt rounds?

Security requirements change over time.

Externalizing the bcrypt cost factor allows future adjustments without requiring source code modifications or application logic changes.

---

# 16. References

- Official bcrypt Documentation
- OWASP Password Storage Cheat Sheet
- OWASP Authentication Cheat Sheet
- Mongoose Middleware Documentation

---

# 17. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Password Hashing Design |
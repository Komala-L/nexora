> This document describes the profile management functionality implemented by Nexora.
> It explains the profile retrieval and update workflow, editable fields, validation strategy, business rules, and design decisions followed by the User Management module.

# Profile Management

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | User Management |
| Document Type | Feature Design |
| Document Version | 0.2 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 17 August 2026 |

---

## Component Structure

| Component | Location |
|----------|----------|
| User Routes | `src/routes/user.routes.js` |
| User Controller | `src/controllers/user.controller.js` |
| User Service | `src/services/user.service.js` |
| User Validation | `src/validations/user.validation.js` |
| User Model | `src/models/user.model.js` |

---

# 1. Overview

The Profile Management feature allows authenticated users to retrieve and update their personal profile information.

It serves as the central interface for maintaining user identity within the Nexora platform while ensuring that sensitive authentication information remains protected.

The module focuses only on profile-related information and does not manage authentication, authorization, or account credentials.

---

# 2. Objectives

The profile management feature is designed to:

- Retrieve the authenticated user's profile.
- Allow users to update profile information.
- Prevent modification of sensitive authentication fields.
- Maintain consistent profile data.
- Support future social networking features.

---

# 3. Supported Operations

The implemented feature supports the following operations.

| Operation | Description |
|----------|-------------|
| Get Current User | Retrieve the authenticated user's profile |
| Update Profile | Modify editable profile fields |

---

# 4. Current User Retrieval

The authenticated user can retrieve their own profile through the following endpoint:

```http
GET /api/v1/users/me
```

The endpoint identifies the authenticated user using the authentication middleware and returns the corresponding profile information.

A successful response may include:

Name
Email
Profile Image
Bio
Interests
Gender
Location
Discovery location where applicable
Account timestamps

Sensitive authentication fields are never exposed.

The response excludes sensitive fields such as:

Password
Refresh token

### One important privacy note

Although `location` may be included in the **current user's own profile response**, it should not be confused with the nearby-user response.

The user is allowed to see **their own** location.

Other users should not receive it.

---

# 5. Profile Update

Authenticated users may update their own profile information using:

```http
PATCH /api/v1/users/me
```

Only approved profile fields may be modified.

The request is validated before the update reaches the service layer.

The service updates the authenticated user's profile and returns the updated user information while excluding sensitive authentication fields.

---

# 6. Editable Fields

The following profile fields are currently supported for modification.

| Field | Purpose |
|--------|----------|
| name | Display name |
| bio | User description |
| interests | Personal interests |

These fields allow users to personalize their profile without affecting authentication or account integrity.

---

# 7. Non-Editable Fields

The following fields cannot be modified through profile management.

| Field | Reason |
|--------|--------|
| email | Authentication/account identity field |
| password | Authentication credential |
| refreshToken | Internal authentication state |
| createdAt | System-generated metadata |
| updatedAt | Automatically maintained |
| _id | Permanent user identifier |

Protecting these fields prevents accidental or unauthorized modification of critical account and authentication information.

---

# 8. Business Rules

The profile management implementation follows these rules.

- Only authenticated users may access protected profile operations.
- Users may update only their own profile.
- Profile updates modify only explicitly approved fields.
- Authentication-related fields are managed separately from profile information.
- Invalid requests are rejected before reaching the service layer.
- Sensitive authentication fields are excluded from user-facing responses.

---

# 9. Validation Strategy

Profile update requests are validated before persistence.

Validation includes:

- Data type validation.
- Name length constraints.
- Bio length constraints.
- Interest array validation.
- Maximum interest count validation.
- Trimming and normalization where applicable.
- Rejection of unsupported fields.

Validation occurs before business logic execution to maintain data consistency and prevent unauthorized fields from being processed.

---

# 10. Security Considerations

The profile management feature follows these security principles.

- Authentication is required for protected profile operations.
- Users can modify only their own profile.
- Only explicitly approved fields can be updated.
- Passwords are never exposed in API responses.
- Refresh tokens are never exposed in API responses.
- Authentication-related fields cannot be modified through the profile update operation.
- Profile update requests are validated before reaching business logic.

---

# 11. Assumptions

The current implementation assumes:

- Users are authenticated before accessing protected profile operations.
- Each user owns exactly one profile.
- Profile updates modify the authenticated user's existing profile.
- Authentication is handled independently by the Authentication module.
- Profile image, location, and authentication operations are handled by their respective features rather than directly through profile updates.

---

# 12. Known Limitations

The current implementation intentionally accepts the following limitations.

- Username support has not yet been implemented.
- Profile privacy settings are not available.
- Profile version history is not maintained.
- Profile completion metrics are not implemented.

These limitations are acceptable for the current development phase.

---

# 13. Future Improvements

The profile management feature may be extended with:

- Username support.
- Profile privacy settings.
- Profile completion indicators.
- Social media links.
- Verification badges.
- Profile version history.
- Custom profile themes.

---

# 14. Out of Scope

This document intentionally does not cover:

- Authentication.
- Password management.
- Profile image management.
- Location management.
- Nearby-user discovery.
- Friend requests.
- Messaging.

These topics are documented separately within the Nexora backend documentation.

---

# 15. Design Decisions

## Why separate profile management from authentication?

Authentication verifies user identity.

Profile management maintains user information after authentication has succeeded.

Separating these responsibilities improves maintainability and follows the principle of separation of concerns.

---

## Why restrict editable fields?

Restricting updates to approved fields prevents accidental modification of authentication data and preserves account integrity.

---

## Why validate requests before business logic?

Incoming requests are validated before reaching the service layer.

This prevents malformed or unsupported data from entering application logic, reduces unnecessary database operations, and ensures that the service layer can operate on data that already satisfies the defined validation rules.

---

# 16. References

- MongoDB Documentation
- Mongoose Documentation
- Express.js Documentation
- HTTP RFC 9110

---

# 17. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Profile Management Design |
| 0.2 | Updated documentation to reflect the completed profile retrieval and update implementation, versioned API routes, strict field validation, protected response fields, and current security behavior |
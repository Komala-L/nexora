> This document describes the User Management module implemented by Nexora.
> It explains the responsibilities, architecture, APIs, implementation strategy, and design decisions used to manage user information after successful authentication.

# User Management Overview

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | User Management |
| Document Type | Module Overview |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 4 August 2026 |

---

## Planned Component Structure

| Component | Location |
|----------|----------|
| User Routes | `src/routes/user.routes.js` |
| User Controller | `src/controllers/user.controller.js` |
| User Service | `src/services/user.service.js` |
| User Validation | `src/validations/user.validation.js` |
| User Model | `src/models/user.model.js` |

---

# 1. Overview

The User Management module is responsible for managing user profile information after successful authentication.

While the Authentication module verifies user identity and establishes authenticated sessions, the User Management module focuses on retrieving, maintaining, and updating user profile information throughout the user's lifecycle within the Nexora platform.

The module provides a centralized interface for profile management, profile image handling, location updates, public profile retrieval, and user search while ensuring sensitive authentication data remains protected.

This separation allows authentication and profile management to evolve independently while maintaining a clean and scalable architecture.

---

# 2. Objectives

The User Management module is designed to:

- Manage authenticated user profile information.
- Allow users to personalize their profile.
- Maintain user identity after authentication.
- Support profile image management.
- Support location-based functionality.
- Enable public profile viewing.
- Support user search.
- Provide a scalable foundation for future social networking features.

---

# 3. Responsibilities

The User Management module is responsible for:

- Retrieving the authenticated user's profile.
- Updating user profile information.
- Managing profile images.
- Managing user location.
- Retrieving public user profiles.
- Searching registered users.

Authentication, authorization, and session management remain outside the scope of this module.

---

# 4. Module APIs

The User Management module currently provides the following endpoints.

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/users/me` | Retrieve the authenticated user's profile |
| PATCH | `/api/v1/users/profile` | Update authenticated user's profile information |
| PATCH | `/api/v1/users/profile/image` | Upload or update the authenticated user's profile image |
| DELETE | `/api/v1/users/profile/image` | Remove the authenticated user's profile image |
| PATCH | `/api/v1/users/location` | Update the authenticated user's location |
| GET | `/api/v1/users/nearby` | Retrieve nearby users within the configured discovery radius |

All protected User Management endpoints require successful authentication.

The nearby-user discovery API uses protected discovery locations and does not expose users' exact coordinates or exact distances.

---

# 5. Architecture

The User Management module follows Nexora's layered architecture.

```
Client

↓

User Routes

↓

Authentication Middleware

↓

Validation Middleware

↓

User Controller

↓

User Service

↓

User Model

↓

MongoDB
```

Each layer has a clearly defined responsibility.

- Routes define available endpoints.
- Authentication middleware verifies user identity.
- Validation middleware validates incoming requests.
- Controllers handle HTTP communication.
- Services implement business logic.
- Models manage database interaction.

This separation improves maintainability, scalability, and testability.

---

# 6. Dependencies

## External Dependencies

- MongoDB
- Mongoose
- Cloudinary
- Multer

## Internal Dependencies

The User Management module depends on:

- Authentication Module
- JWT Authentication Middleware

The module assumes requests have already been authenticated before user-specific operations are performed.

---

# 7. Security Considerations

The User Management module follows several security and privacy principles.

- Authentication is required for protected endpoints.
- Users may modify only their own profile.
- Sensitive authentication fields remain protected.
- Passwords and refresh tokens are never exposed through User Management responses.
- Uploaded profile images are validated before processing.
- Profile images are stored externally using Cloudinary rather than directly in MongoDB.
- User location data is validated before persistence.
- Exact user locations are never exposed through the nearby-user discovery API.
- Nearby-user discovery uses a separate `discoveryLocation` rather than exposing or querying against the user's private location.
- Female users use a randomized protected discovery location to reduce the possibility of determining their exact physical location.
- Nearby-user discovery is limited to a maximum configured radius.
- Exact distance between users is not returned to clients.
- Business logic remains isolated from the HTTP layer through the service architecture.
- Public APIs expose only fields required for the corresponding operation.

---

# 8. Assumptions

The current implementation assumes:

- Users are authenticated before accessing protected endpoints.
- Every user owns a single profile.
- Profile images are stored using Cloudinary.
- Profile image metadata contains the Cloudinary asset URL and file identifier.
- User locations follow the GeoJSON Point specification.
- MongoDB `2dsphere` indexes are used for geospatial queries.
- A user's actual location is treated as private information.
- Nearby-user discovery uses a protected `discoveryLocation`.
- Female users receive a randomized discovery location to provide additional location privacy.
- Authentication is managed independently by the Authentication module.

---

# 9. Known Limitations

The current implementation intentionally accepts the following limitations.

- Multiple profile images are not supported.
- Username support has not yet been implemented.
- Profile privacy settings are not available.
- Advanced search filters are not currently supported.
- Image cropping is not implemented.
- Nearby-user discovery currently uses a fixed maximum discovery radius.
- Discovery location randomization is currently applied according to the implemented gender-based privacy rules.
- Fine-grained user-controlled location privacy settings have not yet been implemented.

---

# 10. Future Improvements

The User Management module may be extended with:

- Username support.
- Cover images.
- Profile privacy settings.
- User-configurable location privacy settings.
- Verification badges.
- Social media links.
- Online presence.
- Last active status.
- Multiple profile images.
- Advanced search filters.
- Profile analytics.

---

# 11. Out of Scope

This document intentionally does not cover:

- Authentication.
- JWT implementation.
- Password hashing.
- Refresh token management.
- Friend requests.
- Messaging.
- Notifications.

These topics are documented independently within their respective modules.

---

# 12. Design Decisions

## Why separate User Management from Authentication?

Authentication is responsible for verifying user identity and establishing authenticated sessions.

User Management is responsible for maintaining user information after authentication has succeeded.

Separating these responsibilities improves maintainability and follows the principle of separation of concerns.

---

## Why store profile images externally?

Profile images are stored using Cloudinary rather than directly in MongoDB.

This keeps binary image data out of the database, reduces database storage requirements, and provides optimized image delivery through Cloudinary's CDN and transformation capabilities.

MongoDB stores only the image metadata required by Nexora, including the Cloudinary asset URL and file identifier.

---

## Why use GeoJSON for location?

GeoJSON is the standard geospatial format supported by MongoDB.

Using GeoJSON enables efficient geospatial indexing and radius-based queries required for Nexora's nearby user discovery feature.

---

## Why use a separate discoveryLocation?

Nexora stores both the user's actual location and a protected `discoveryLocation`.

The `location` field represents the user's actual geographic position and is treated as private information.

The `discoveryLocation` field is used for location-based user discovery. This prevents the nearby-user feature from directly exposing or relying on the user's exact physical location.

For female users, the discovery location is randomized around the actual location within the configured protection range. This allows nearby discovery to remain functional while making it significantly harder for another user to determine the exact physical location.

The nearby-user API returns profile information only and does not expose either `location`, `discoveryLocation`, or the exact distance between users.

---

## Why limit nearby-user discovery to a maximum radius?

Nearby-user discovery uses a maximum search radius to ensure that the API returns users who are meaningfully nearby rather than simply returning the closest users regardless of their actual distance.

The current implementation uses a maximum discovery radius of 10 km.

MongoDB performs the geospatial query using the `2dsphere` index and the protected `discoveryLocation` field.

The API does not return the calculated distance to the client.

---

## Why separate public profile retrieval from profile management?

Users should be able to manage their own profile independently from viewing another user's profile.

Separating these operations simplifies authorization logic and improves long-term maintainability.

---

## Why keep business logic inside the service layer?

Keeping business logic within the service layer prevents controllers from becoming tightly coupled to application behavior.

This improves modularity, simplifies testing, and promotes cleaner application architecture.

---

# 13. References

- MongoDB Documentation
- Mongoose Documentation
- Cloudinary Documentation
- Multer Documentation
- GeoJSON Specification

---

# 14. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial User Management Module Overview |
| 0.2 | Updated documentation to reflect completed implementation, Cloudinary integration, profile image removal, protected discovery locations, randomized female-user discovery locations, and nearby-user discovery with a 10 km maximum radius |
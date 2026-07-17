> This document describes the design decisions for the User model before implementation.
> It serves as the source of truth for architecture and may evolve as the project grows.

# User Model Design

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | User Management |
| Document Type | Database Design |
| Document Version | 0.1 |
| Status | In Progress |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 16 July 2026 |

---

# 1. Overview

The User model represents every registered user within the Nexora platform.

It acts as the central entity responsible for user identity, authentication, profile information, and location.

Most application features directly or indirectly depend on the User model.

Examples include:

- Authentication
- Nearby user discovery
- Friend requests
- Messaging
- Notifications
- User search
- Profile management

Because of this, the User model should remain focused on core user information while avoiding responsibilities that belong to separate domains.

---

# 2. Business Requirements

The User model exists to support the following business capabilities:

- Register new users
- Authenticate users
- Discover nearby users
- Maintain user profiles
- Enable future social interactions

---

# 3. Objectives

The User model should support:

- User registration
- User authentication
- Profile management
- Location-based search
- Profile customization
- Support future social networking features.

The model should be scalable and easy to extend without major structural changes.

---

# 4. Responsibilities

The User model is responsible for storing:

## Identity

- Name
- Email address

Purpose:

Uniquely identify a user within the system.

---

## Authentication

Stores credentials required for login.

Initially:

- Email
- Password

Passwords are stored only as bcrypt hashes. Hashing is performed automatically by a Mongoose pre-save middleware. Plain-text passwords are never persisted.

Future authentication methods may include:

- Google OAuth
- GitHub OAuth
- Phone OTP Authentication

The schema should remain flexible enough to support multiple authentication providers.

---

## Profile Information

Stores information visible to other users.

Examples:

- Profile picture
- Bio
- Interests

This information helps users identify each other and improves future recommendation systems.

---

## Location

Stores the user's latest location.

Purpose:

Enable nearby user discovery.

The location should support efficient geospatial queries.

MongoDB GeoJSON format is preferred because it allows native location indexing and radius-based searches.

---

## System Metadata

Tracks information required by the application itself.

Examples:

- Account creation time
- Last update time

Additional metadata may be introduced in future versions.

---

# 5. Responsibilities Outside This Model

The following features should NOT be stored inside the User model.

## Friend Requests

Reason:

Friend requests represent relationships between two users.

A dedicated FriendRequest model will provide better scalability and maintainability.

---

## Messages

Messages belong to conversations rather than users.

A separate Message model will be created.

---

## Conversations

Conversation management should remain independent from user data.

---

## Notifications

Notifications change frequently and should not increase the size of the User document.

A dedicated Notification model will be introduced later.

---

# 6. Dependencies

## External Dependencies

- MongoDB – Stores user data.
- Mongoose – Provides schema definition and database interaction.
- GeoJSON – Enables geospatial location storage for nearby user discovery.

## Internal Dependencies

The User model will be used by the following modules:

- Authentication
- User Profile
- Friend Requests
- Conversations
- Messages
- Notifications

These modules depend on the User model as the central source of user identity.

---

# 7. Expected Fields

| Field | Purpose |
|--------|----------|
| name | Display name |
| email | User login identifier |
| password | Authentication credential |
| profileImage | User avatar |
| bio | Short profile description |
| interests | User preferences |
| location | Geographical location |
| createdAt | Record creation time |
| updatedAt | Record update time |

---

# 8. Security Considerations

Sensitive information must never be exposed unintentionally.

Examples:

- Password should never be returned in API responses.
- Internal authentication fields should remain private.
- Validation should prevent invalid user data.

Authentication logic should remain outside the model whenever possible.

---

# 9. Scalability Considerations

The model should support future growth.

Expected deferred implementations include:

- Nearby user recommendations
- Mutual interests
- Online status
- Profile privacy settings
- User blocking
- Premium features

The current design should minimize future schema modifications.

---

# 10. Performance Considerations

Expected query patterns:

- Find user by email
- Find user by ID
- Find nearby users
- Search users by name

The User model should define indexes only for frequently queried fields to balance read performance, write performance, and storage overhead.

Geospatial indexing will be required for location searches.

---

# 11. Validation Strategy

The model should validate:

- Required fields
- Email format
- Password constraints
- Maximum bio length
- Allowed profile image format

Business rules should remain separated from database validation whenever possible.

Input validation should occur at both the API layer and the database layer.

The schema acts as the final line of defense against invalid data.

---

# 12. Future Improvements

The following features are intentionally postponed:

- Email verification
- Phone verification
- Google Login
- GitHub Login
- Two-factor authentication
- Last active timestamp
- Online presence
- Soft delete
- Account status
- User roles
- Audit logging

These will be implemented when the corresponding application modules are introduced.

---

# 13. Assumptions

The current design is based on the following assumptions:

- Every registered user has one unique email address.
- A user owns a single profile.
- Location updates replace the previous location.
- Profile images are stored using an external cloud storage provider.
- Passwords are stored only in hashed form.

---

# 14. Design Decisions

## Why keep friend requests separate?

Friend requests represent relationships rather than user properties.

Separating them reduces document size and simplifies future queries.

---

## Why use GeoJSON?

Nexora's primary feature is discovering nearby users.

MongoDB's geospatial capabilities provide efficient radius-based searches.

GeoJSON integrates directly with these capabilities.

---

## Why keep the User model small?

A single document should represent only the user's own information.

Relationships and high-frequency data belong to dedicated collections.

This improves scalability and maintainability.

---

# 15. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial User Model Design |
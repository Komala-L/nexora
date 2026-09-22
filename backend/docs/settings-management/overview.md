# Nexora Settings Management Overview

> This document describes the architecture, responsibilities, business rules, validation, security controls, and implementation principles of the Nexora Settings Management module.
> It explains how Nexora retrieves and updates user preferences, privacy visibility, password security, account information, and account deletion.

---

## Document Information

| Property | Value |
|---|---|
| Project | Nexora |
| Module | Settings Management |
| Document Type | Settings Management Overview |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 22 September 2026 |

---

## Implementation Location

| Component | Location |
|---|---|
| Settings Controller | `src/controllers/settings.controller.js` |
| Settings Service | `src/services/settings.service.js` |
| Settings Routes | `src/routes/settings.routes.js` |
| Settings Validation | `src/validations/settings.validation.js` |
| Security Controller | `src/controllers/security.controller.js` |
| Security Service | `src/services/security.service.js` |
| Security Routes | `src/routes/security.routes.js` |
| Security Validation | `src/validations/security.validation.js` |
| Account Controller | `src/controllers/account.controller.js` |
| Account Validation | `src/validations/account.validation.js` |
| User Model | `src/models/user.model.js` |

---

## 1. Overview

The Nexora Settings Management module provides users with centralized controls for managing their discovery preferences, privacy visibility, account security, account information, and account deletion.

The module is divided into three primary areas:

- Discovery
- Security
- Account

The Discovery section allows users to control the types of people they want to discover and whether their profile can appear in discovery results.

The Security section allows users to change their account password after verifying their current password.

The Account section displays account information and provides a permanent account deletion workflow.

The Settings module integrates with Authentication and User Management and interacts with Connection, Conversation, Message, and Notification data during account deletion.
---

## 2. Responsibilities

The Settings Management module is responsible for:

- Retrieving the authenticated user's settings.
- Updating discovery preferences.
- Managing profile discoverability.
- Validating settings updates.
- Allowing authenticated users to change their password.
- Verifying the current password before allowing sensitive security changes.
- Preventing users from changing their password to the same password.
- Displaying account information.
- Verifying the current password before account deletion.
- Requiring explicit account deletion confirmation on the frontend.
- Removing account-related data during account deletion.
- Clearing authentication cookies after successful account deletion.

---

## 3. Settings Architecture

The Settings module follows the Nexora layered architecture:

```text
Client
  ↓
Settings / Security Routes
  ↓
Authentication Middleware
  ↓
Validation Middleware
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
MongoDB
```

Sensitive operations such as password changes and account deletion include additional verification requirements enforced by the service layer.

---

## 4. Settings Categories

The Settings interface is organized into three primary areas:

* Discovery
* Security
* Account

### 4.1 Discovery

Discovery settings control the user's discovery preferences and profile discoverability.

### 4.2 Security

Security settings provide password management for the authenticated account.

### 4.3 Account

Account settings provide account information and permanent account deletion.

---

## 5. Discovery Preferences

Discovery preferences are stored in the authenticated user's `discoveryPreferences` field.

Supported values are:

```text
friends
professional
learning
```

The backend independently validates the submitted preferences using Zod.

**Business Rules**

- At least one discovery preference is required when the field is provided.
- A maximum of three discovery preferences is allowed.
- Only the supported enum values are accepted.
- Unknown fields are rejected by strict validation.

---

## 6. Privacy and Discoverability

The privacy functionality is represented internally by the `isDiscoverable` field.

The internal meaning is:

| `isDiscoverable` | Profile Visibility |
|---|---|
| `true` | Profile can appear in discovery |
| `false` | Profile is hidden from discovery |

The frontend presents this functionality as a **Privacy** toggle.

Therefore, the frontend intentionally uses the inverse state:

```text
Privacy enabled  -> isDiscoverable = false
Privacy disabled -> isDiscoverable = true
```

This allows the user-facing interface to follow the expected privacy convention where enabling Privacy means hiding the profile.

---

## 7. Password Management

Password management is handled as a Security operation within the Settings module.

Authenticated users can change their password after providing the required password information.

The operation verifies the current password before allowing the password to be changed.

---

## 8. Account Information

The Account section retrieves the authenticated user's information through the existing user service.

The Settings page does not directly modify these account information fields.

---

## 9. Account Deletion

Account deletion permanently removes the authenticated user's account and associated account data.

The deletion process verifies the user's current password before performing the operation.

The service removes related connections, conversations, messages, and notifications before deleting the user account.

Authentication cookies are cleared after successful deletion.

---

## 10. Account Deletion Data Handling

Account deletion removes data associated with the deleted user, including:

* Connections involving the user.
* Conversations involving the user.
* Messages belonging to those conversations.
* Notifications belonging to the user.
* The user account document.

Related conversation messages are removed before the conversations themselves are deleted.

---

## 11. Error Handling

The Settings module uses the existing Nexora error-handling architecture.

Errors may occur when:

* The authenticated user cannot be found.
* Current-password verification fails.
* Settings validation fails.
* Password requirements are not satisfied.
* The new password matches the existing password.
* Account deletion validation fails.

---

## 12. Security Considerations

Settings operations require authentication.

Sensitive operations such as password changes and account deletion require additional verification.

Settings updates are validated before business logic is executed.

The detailed security controls are documented in `security.md`.

---

## 13. Module Dependencies

The Settings Management module integrates with several Nexora modules.

| Module | Relationship |
|---|---|
| Authentication | Provides authenticated user identity |
| User Management | Stores user settings and account information |
| Connection Management | Provides connection data removed during account deletion |
| Conversation Management | Provides conversations removed during account deletion |
| Message Management | Provides messages removed during account deletion |
| Notification Management | Provides notifications removed during account deletion |

The account deletion workflow particularly depends on connection, conversation, message, notification, and user data.

---

## 14. Design Principles

The Settings module follows these principles:

**Separation of Responsibilities**

Controllers handle HTTP requests and responses, while services contain business logic.

**Validation Before Business Logic**

Requests are validated before reaching the corresponding service operations.

**Authentication First**

Settings, password changes, and account deletion operate only for authenticated users.

**Sensitive Operations Require Verification**

Password changes and account deletion require verification of the current password.

**Explicit Destructive Actions**

Account deletion requires both password verification and explicit frontend confirmation.

**Partial Settings Updates**

The Settings PATCH endpoint updates only fields supplied by the client.

---

## 15. Current Implementation Scope

The current Settings module supports:

- Discovery preference management.
- Privacy visibility management.
- Password changes.
- Account information display.
- Permanent account deletion.
- Destructive-action confirmation.
- Authentication cookie cleanup.

The module currently does not implement additional account preferences beyond the settings described above.

---

## 16. Future Enhancements

Potential future enhancements include:

* Email change and verification.
* Two-factor authentication.
* Active session management.
* Login activity history.
* Password reset management.
* Additional privacy controls.
* Data export before account deletion.
* Confirmation notifications for sensitive account changes.

---

## 17. Revision History

| Version | Description |
|---|---|
| 0.1 | Initial Settings Management overview documentation |
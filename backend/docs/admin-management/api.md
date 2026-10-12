> This document describes the API organization of the Admin module implemented by Nexora.
> It explains the responsibilities of administrative endpoints, authentication requirements, request workflows, and the separation of API operations across administrative features.

# Admin API Design

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Admin Management |
| Document Type | API Design |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 12 October 2026 |

---

# 1. Overview

The Admin API provides the backend interface used by the Nexora administrative frontend.

It supports administrator authentication, dashboard statistics, platform activity retrieval, user administration, report management, moderation, and platform settings.

The API follows the versioned API structure used by Nexora.

The common API prefix is:

```text
/api/v1
```

Administrative operations are separated into route modules according to their responsibilities.

---

# 2. Objectives

The Admin API is designed to:

- Provide endpoints for administrative functionality.
- Protect administrative operations.
- Separate API responsibilities by feature.
- Keep HTTP request handling separate from business logic.
- Return structured responses to the administrative frontend.
- Support dashboard statistics and platform activity.
- Support user and report administration.
- Provide access to supported platform settings.

---

# 3. Route Structure

The known administrative route modules are:

| Route Module | Location | Responsibility |
|----------|----------|----------|
| Admin Authentication | `src/routes/admin/adminAuth.routes.js` | Administrator authentication operations |
| Admin Users | `src/routes/admin/adminUser.routes.js` | User administration and dashboard data |
| Admin Reports | `src/routes/admin/adminReport.routes.js` | Report management and moderation |
| Admin Settings | `src/routes/admin/adminSettings.routes.js` | Platform settings operations |

The exact HTTP methods and subpaths for authentication, reports, and settings should be kept consistent with their route definitions in the source code.

---

# 4. Admin User API

The Admin User API supports user administration and dashboard data retrieval.

## 4.1 Retrieve Users

```http
GET /api/v1/admin/users
```

The user-list operation retrieves user records for the administrative interface.

The service supports the following query parameters:

| Parameter | Purpose |
|----------|----------|
| `page` | Requested page number |
| `limit` | Number of records per page |
| `search` | Search text |

The endpoint uses pagination to retrieve a manageable subset of records.

## 4.2 Retrieve Dashboard Statistics

```http
GET /api/v1/admin/users/stats
```

This endpoint retrieves the summary statistics displayed on the admin dashboard.

The existing response contains:

| Field | Description |
|----------|----------|
| `totalUsers` | Total number of users |
| `completedProfiles` | Number of users meeting the implementation's profile-completion criteria |
| `discoverableUsers` | Number of users eligible for discovery under the implementation's criteria |
| `newRegistrations` | Number of new registrations calculated by the existing statistics service |

The exact counting criteria are determined by the existing `getAdminDashboardStats` implementation.

The existing response contract is preserved for compatibility with the dashboard.

## 4.3 Retrieve Platform Activity

```http
GET /api/v1/admin/users/activity?days=7
```

The activity endpoint retrieves platform activity data for the admin dashboard.

Supported period selections are:

| Query Parameter | Meaning |
|----------|----------|
| `days=7` | Seven-day activity view |
| `days=30` | Thirty-day activity view |

The activity response is designed to contain:

| Field | Description |
|----------|----------|
| `periodDays` | Selected activity period |
| `recentlySeenUsers` | Users with a recorded last-seen timestamp within the selected period |
| `recentlySeenLabel` | Explanation of the recently seen metric |
| `pendingReports` | Current number of reports with pending status |
| `registrationChart` | Daily registration totals for the selected period |
| `recentActivity` | Recent registration, report, and moderation events |

A registration chart entry has the following structure:

```json
{
  "date": "2026-10-12",
  "registrations": 4
}
```

A recent activity item may contain:

```json
{
  "id": "registration-example",
  "type": "registration",
  "message": "Example User registered",
  "createdAt": "2026-10-12T10:00:00.000Z"
}
```

The example values above are illustrative only.

The actual response depends on the records available in the database.

## 4.4 Retrieve User Details

```http
GET /api/v1/admin/users/:userId
```

This endpoint retrieves an individual user record for administrative inspection.

The service validates the supplied identifier before attempting to retrieve the requested user.

---

# 5. Report and Moderation API

The Admin Report API handles report retrieval and report-related administrative operations.

The route module is:

```text
src/routes/admin/adminReport.routes.js
```

The corresponding controller and service are:

```text
src/controllers/admin/adminReport.controller.js
src/services/admin/adminReport.service.js
```

The report model contains fields for the reporter, reported user, reason, status, administrative notes, account action, reviewer, and review timestamp.

Supported report statuses in the data model are:

- `pending`
- `reviewing`
- `resolved`
- `dismissed`

Supported report reasons include:

- `harassment`
- `spam`
- `fake_profile`
- `inappropriate_content`
- `scam`
- `other`

The precise report endpoint paths and request payloads are defined by `adminReport.routes.js` and the associated validation and service implementations.

---

# 6. Platform Settings API

The Admin Settings API manages supported platform-level configuration.

The route module is:

```text
src/routes/admin/adminSettings.routes.js
```

The corresponding controller and service are:

```text
src/controllers/admin/adminSettings.controller.js
src/services/admin/adminSettings.service.js
```

The frontend dashboard includes settings for:

- Maintenance Mode.
- New User Registration.

The exact setting names, request payloads, HTTP methods, and persistence strategy are defined by the existing settings implementation.

The frontend should use the corresponding settings API rather than modifying backend configuration directly.

---

# 7. Authentication Requirements

Administrative endpoints that use `adminAuthMiddleware` require successful administrator authentication.

The middleware is responsible for enforcing the authentication requirements defined by the Admin module.

The exact session or token mechanism is determined by the admin authentication implementation.

Administrative authorization must be enforced on the backend, not only by hiding frontend pages or controls.

---

# 8. Request Processing Workflow

Administrative API requests follow the general workflow below.

```text
Admin Frontend
      |
      v
HTTP Request
      |
      v
Admin Route
      |
      v
Authentication Middleware
      |
      v
Controller
      |
      v
Service
      |
      v
Database Operation
      |
      v
Structured API Response
```

Protected requests that fail authentication or validation should not proceed to the corresponding business operation.

---

# 9. Error Handling

Administrative endpoints should return appropriate error responses when:

- Authentication fails.
- A requested record does not exist.
- An identifier is invalid.
- A query parameter is invalid.
- Request validation fails.
- A database operation fails.
- A platform setting cannot be updated.

Errors should follow Nexora's existing error-handling conventions.

Internal stack traces, credentials, and sensitive configuration values must not be returned to the client.

---

# 10. Security Considerations

- Protected administrative endpoints must use the appropriate authentication middleware.
- Request parameters must be validated.
- User identifiers must be validated before database lookup.
- Administrative actions must be enforced by backend services.
- Sensitive user information should be returned only when required by the administrative operation.
- Administrative settings must not be writable by ordinary users.
- The frontend must not be treated as the sole authorization boundary.
- API responses must not expose passwords, refresh tokens, or secret configuration values.

---

# 11. Assumptions

The current API organization assumes:

- Administrative routes are mounted under the configured `/api/v1` prefix.
- Administrative route modules are registered in the backend application.
- Controllers delegate business logic to services.
- Models are responsible for database interaction.
- Protected administrative operations use the appropriate authentication middleware.
- The dashboard uses the existing admin user service for summary statistics and platform activity.

---

# 12. Known Limitations

- Exact API details for each feature depend on the corresponding route and validation implementations.
- Activity history is limited to recorded events.
- Dashboard data can be temporarily stale between refreshes.
- API behavior depends on database availability.
- This document does not define an independent API specification for every individual report or settings operation.

---

# 13. Future Improvements

- Publish a complete OpenAPI specification.
- Standardize pagination metadata.
- Standardize error response structures across administrative endpoints.
- Add more advanced administrative filtering.
- Introduce audit-log retrieval endpoints.
- Add API contract tests.
- Document all request and response schemas alongside the corresponding route definitions.

---

# 14. Out of Scope

This document does not describe:

- Regular user API operations.
- Password reset implementation.
- User messaging APIs.
- Connection management APIs.
- Notification delivery APIs.

---

# 15. Design Decisions

## Why separate API routes by feature?

Separating authentication, users, reports, and settings into dedicated route modules keeps the API organized and makes each feature easier to maintain.

## Why use controllers and services?

Controllers handle HTTP communication, while services implement business logic.

This separation improves maintainability and reduces coupling between HTTP request handling and database operations.

## Why preserve the dashboard statistics response?

Keeping the existing statistics response unchanged avoids unnecessary changes to the frontend and other code that may depend on the existing fields.

## Why protect administrative endpoints on the backend?

Frontend controls can be bypassed. Backend authentication and authorization ensure that administrative operations remain protected even when requests are made outside the intended UI.

---

# 16. References

- Express.js Documentation.
- Mongoose Documentation.
- MongoDB Documentation.
- HTTP Semantics — RFC 9110.
- OWASP API Security Top 10.

---

# 17. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Admin API documentation covering administrative route organization, dashboard statistics, platform activity, user administration, reports, moderation, and settings. |
> This document describes user administration functionality implemented by Nexora.
> It explains how administrators retrieve user lists, search users, paginate results, inspect user details, and interact with user records through the Admin module.

# Admin User Management

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Admin Management |
| Document Type | Feature Design |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 12 October 2026 |

---

## Component Structure

| Component | Location |
|----------|----------|
| Admin User Routes | `src/routes/admin/adminUser.routes.js` |
| Admin User Controller | `src/controllers/admin/adminUser.controller.js` |
| Admin User Service | `src/services/admin/adminUser.service.js` |
| User Model | `src/models/user.model.js` |
| Admin Authentication Middleware | `src/middleware/adminAuth.middleware.js` |
| Frontend Admin User Service | `frontend/src/services/adminUser.service.js` |

---

# 1. Overview

The Admin User Management feature provides authorized administrators with access to user records.

It supports user listing, searching, pagination, and individual user detail retrieval.

This functionality is distinct from regular User Management, which allows authenticated users to manage their own profile information.

Administrative user retrieval is handled by dedicated admin routes and services.

---

# 2. Objectives

The feature is designed to:

- Retrieve registered users for administrative inspection.
- Support searching through user records.
- Paginate user-list results.
- Retrieve individual user details.
- Keep database queries within the backend service layer.
- Protect administrative operations through admin authentication.
- Maintain separation between user self-service and administrative operations.

---

# 3. Responsibilities

Admin User Management is responsible for:

- Retrieving user records.
- Applying supported search criteria.
- Applying pagination parameters.
- Retrieving an individual user by identifier.
- Providing data for the admin dashboard.
- Returning data through the existing administrative API response structure.

Report review and moderation actions are handled by the corresponding report and moderation functionality.

---

# 4. Supported Operations

| Operation | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Retrieve Users | GET | `/api/v1/admin/users` | Retrieve a paginated user list |
| Retrieve Dashboard Statistics | GET | `/api/v1/admin/users/stats` | Retrieve summary dashboard statistics |
| Retrieve Platform Activity | GET | `/api/v1/admin/users/activity` | Retrieve platform activity metrics and events |
| Retrieve User Details | GET | `/api/v1/admin/users/:userId` | Retrieve an individual user's details |

All endpoints must follow the authentication requirements defined by their route configuration.

---

# 5. User Listing

The user listing operation retrieves a subset of user records.

```http
GET /api/v1/admin/users
```

The endpoint supports the following query parameters.

| Parameter | Purpose |
|----------|----------|
| `page` | Selects the requested page |
| `limit` | Sets the number of records requested |
| `search` | Provides search text |

Example:

```http
GET /api/v1/admin/users?page=1&limit=10&search=Komala
```

The example demonstrates query parameter usage.

The actual returned records depend on the database and search implementation.

---

# 6. Pagination

Pagination allows the administrative interface to retrieve a manageable subset of user records instead of requesting the entire collection in a single operation.

The supported parameters are:

- `page`
- `limit`

The backend service is responsible for applying the corresponding pagination behavior.

Pagination helps control response size and supports the user-list interface as the number of registered users increases.

---

# 7. User Search

The user-list API supports a `search` query parameter.

Search behavior is implemented by the admin user service.

The precise fields included in the search criteria are determined by the existing service implementation.

The service is responsible for applying the search criteria before returning the requested user records.

---

# 8. Individual User Details

An administrator can request a specific user record using:

```http
GET /api/v1/admin/users/:userId
```

The identifier is validated before the service retrieves the record.

If the identifier is invalid or the requested user does not exist, the operation should follow Nexora's established error-handling behavior.

The exact set of returned fields is defined by the existing admin user service.

---

# 9. Dashboard Statistics Dependency

The Admin User service also provides dashboard statistics.

The statistics endpoint returns the existing summary fields:

- `totalUsers`
- `completedProfiles`
- `discoverableUsers`
- `newRegistrations`

These values are used by the dashboard summary cards.

The statistics implementation remains separate from the user-list response so that dashboard metrics can be retrieved without loading the full user list.

---

# 10. Platform Activity Dependency

The Admin User service also provides the Platform Activity data used by the dashboard.

The activity operation retrieves:

- Recorded last-seen information.
- Pending report count.
- Daily registration totals.
- Recent registration events.
- Recent report events.
- Recent moderation events.

The activity endpoint is documented in `api.md` and the dashboard behavior is documented in `dashboard.md`.

---

# 11. Data Access Workflow

The user administration workflow follows the architecture below.

```text
Admin Frontend
      |
      v
Admin User API
      |
      v
Admin Authentication Middleware
      |
      v
Admin User Controller
      |
      v
Admin User Service
      |
      v
User Model
      |
      v
MongoDB
```

The controller handles the HTTP request and delegates the operation to the service.

The service applies the relevant query logic and uses the user model to retrieve the required records.

---

# 12. Security Considerations

- Administrative user retrieval must be protected by the configured admin authentication.
- User identifiers must be validated before database lookup.
- Search input must be processed through the backend service.
- Sensitive authentication information must not be returned unnecessarily.
- User-facing profile permissions must not be assumed to grant administrative access.
- The backend must remain responsible for authorization and data filtering.
- Administrative user retrieval must follow the response structure defined by the existing implementation.

---

# 13. Assumptions

The current implementation assumes:

- User records are stored in MongoDB.
- Mongoose is used for database interaction.
- Admin routes enforce the appropriate authentication requirements.
- User listing and detail retrieval are implemented in the admin user service.
- Pagination and search parameters are processed by the backend.
- The frontend consumes the admin user API through its service layer.

---

# 14. Known Limitations

- The exact search fields depend on the current service implementation.
- The available user details depend on the fields selected by the backend.
- Advanced filtering and sorting are not documented as implemented unless present in the actual service.
- The user listing is dependent on database availability.
- Administrative user retrieval does not replace the dedicated report and moderation workflows.

---

# 15. Future Improvements

The feature may be extended with:

- Additional user filters.
- Sorting by registration date.
- Filtering by account status.
- Filtering by profile completion.
- User record export.
- More detailed user activity history.
- Improved search ranking.
- Bulk administrative operations, where appropriate.
- Additional pagination metadata.

---

# 16. Out of Scope

This document does not describe:

- Regular user profile updates.
- Profile image management.
- User location updates.
- Friend requests.
- Messaging.
- Report resolution.
- Moderation action execution.

These responsibilities belong to their respective modules.

---

# 17. Design Decisions

## Why separate admin user retrieval from regular User Management?

Regular User Management allows users to maintain their own profile.

Admin User Management provides a separate administrative interface for inspecting registered users.

This separation helps keep administrative behavior isolated from user self-service operations.

## Why use pagination?

Pagination limits the number of records retrieved per request, improving response-size management and supporting larger user collections.

## Why validate user identifiers?

Identifier validation prevents malformed identifiers from being passed directly to database lookup operations.

## Why keep database logic in the service layer?

The service layer centralizes query behavior and keeps the controller focused on HTTP request and response handling.

---

# 18. References

- MongoDB Documentation.
- Mongoose Documentation.
- Express.js Documentation.
- HTTP Semantics — RFC 9110.
- OWASP API Security Top 10.

---

# 19. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Admin User Management documentation covering user listing, search, pagination, individual user retrieval, and dashboard data dependencies. |
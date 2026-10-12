> This document describes the Admin module implemented by Nexora.
> It explains the responsibilities, architecture, authentication requirements, dashboard functionality, user administration, report moderation, platform settings, and design decisions used to manage the Nexora platform.

# Admin Module Overview

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Admin Management |
| Document Type | Module Overview |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 12 October 2026 |

---

## Component Structure

| Component | Location |
|----------|----------|
| Admin Authentication Controller | `src/controllers/admin/adminAuth.controller.js` |
| Admin Report Controller | `src/controllers/admin/adminReport.controller.js` |
| Admin Settings Controller | `src/controllers/admin/adminSettings.controller.js` |
| Admin User Controller | `src/controllers/admin/adminUser.controller.js` |
| Admin Authentication Middleware | `src/middleware/adminAuth.middleware.js` |
| Admin Authentication Routes | `src/routes/admin/adminAuth.routes.js` |
| Admin Report Routes | `src/routes/admin/adminReport.routes.js` |
| Admin Settings Routes | `src/routes/admin/adminSettings.routes.js` |
| Admin User Routes | `src/routes/admin/adminUser.routes.js` |
| Admin Authentication Service | `src/services/admin/adminAuth.service.js` |
| Admin Report Service | `src/services/admin/adminReport.service.js` |
| Admin Settings Service | `src/services/admin/adminSettings.service.js` |
| Admin User Service | `src/services/admin/adminUser.service.js` |
| Admin Model | `src/models/admin.model.js` |
| Admin User Interface | `frontend/src/pages/admin/AdminDashboard.jsx` |

The listed locations describe the known Admin module structure. Additional components may exist for validation, models, utilities, and other frontend pages.

---

# 1. Overview

The Admin Management module provides administrative functionality for managing and monitoring the Nexora platform.

While the regular User Management module focuses on users maintaining their own profiles, the Admin module provides authorized administrative access to platform-level information and operations.

The module includes administrator authentication, a centralized dashboard, user administration, report review, moderation functionality, platform settings, and platform activity monitoring.

The dashboard presents important platform statistics and administrative information through a centralized interface. Report and moderation functionality supports the review of reported users and the recording of administrative actions.

Platform settings allow administrators to manage the supported application-level configuration options through the admin interface.

The module follows Nexora's layered backend architecture to keep route handling, request processing, business logic, and database operations separated.

---

# 2. Objectives

The Admin module is designed to:

- Provide a dedicated interface for authorized administrators.
- Protect administrative operations from unauthorized access.
- Present important platform statistics in a centralized dashboard.
- Support user listing, searching, pagination, and detail retrieval.
- Support the review and management of user reports.
- Support moderation actions and moderation history.
- Provide access to supported platform settings.
- Display registration trends and recent platform activity.
- Maintain a clear separation between administrative and regular user functionality.
- Provide a maintainable foundation for future administrative capabilities.

---

# 3. Responsibilities

The Admin module is responsible for:

- Authenticating administrators through the admin authentication workflow.
- Protecting administrative endpoints.
- Retrieving dashboard statistics.
- Displaying platform activity information.
- Retrieving and searching user records.
- Providing administrative access to user details.
- Retrieving and processing reports through the report management workflow.
- Recording moderation actions through the moderation functionality.
- Retrieving and updating supported platform settings.
- Providing a consistent administrative interface.

The module does not replace the regular user's profile management, connection management, messaging, or notification workflows.

---

# 4. Main Features

## 4.1 Administrator Authentication

The Admin module provides a dedicated authentication workflow for administrators.

Administrative authentication is separated from ordinary user authentication so that access to administrative functionality can be controlled independently.

Protected admin APIs use the admin authentication middleware.

Administrator registration, login, session handling, and credential-management details are implemented in the relevant authentication components.

## 4.2 Admin Dashboard

The dashboard provides an overview of the platform through four primary statistics:

- Total users.
- Completed profiles.
- Discoverable users.
- New registrations.

The dashboard also includes:

- Platform Activity.
- Registration charts.
- Recently seen user statistics.
- Pending report count.
- Recent activity events.
- Maintenance Mode settings.
- New User Registration settings.
- Admin Account information.

The dashboard refreshes its displayed statistics and activity information periodically.

## 4.3 User Administration

The user administration functionality provides administrative access to user records.

Supported functionality includes:

- Retrieving user lists.
- Searching users.
- Paginating user results.
- Retrieving individual user details.

The admin user service separates these operations from the controller and route layers.

## 4.4 Report Management and Moderation

The report management functionality supports administrative review of reports submitted about users.

The report model records information such as the reporter, reported user, reason, status, review information, and account action where applicable.

The moderation functionality supports actions such as:

- Warning.
- Final warning.
- Temporary suspension.
- Permanent ban.
- Suspension expiration recording.

Moderation history is maintained on the affected user record, including the action, reason, related report where applicable, administrator, creation time, expiration time, and acknowledgement time where applicable.

## 4.5 Platform Settings

The platform settings interface provides controls for supported platform-level settings.

The dashboard includes controls for:

- Maintenance Mode.
- New User Registration.

These settings are distinct from ordinary user profile preferences.

## 4.6 Platform Activity

The Platform Activity section displays data retrieved from the backend rather than relying on hardcoded demonstration values.

It includes:

- A recently seen user count based on recorded last-seen timestamps.
- Pending report count.
- Daily registration counts.
- A selectable seven-day or thirty-day registration view.
- Recent registration events.
- Recent report submission events.
- Recent moderation events.

The activity feed combines available events from the database and presents them in chronological order.

---

# 5. Architecture

The Admin module follows the layered architecture used throughout Nexora.

```text
Admin Dashboard
      |
      v
Admin API Request
      |
      v
Admin Routes
      |
      v
Admin Authentication Middleware
      |
      v
Admin Controller
      |
      v
Admin Service
      |
      v
Mongoose Models
      |
      v
MongoDB
```

Each layer has a defined responsibility.

- **Routes:** Define administrative API endpoints.
- **Authentication middleware:** Restricts protected endpoints to authenticated administrators.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Implement administrative business logic.
- **Models:** Define database structures and support database operations.
- **Frontend:** Presents administrative information and provides controls for supported operations.

The frontend communicates with the backend through the administrative API services.

---

# 6. Dependencies

## External Dependencies

- MongoDB.
- Mongoose.
- Express.js.
- React.
- Browser Fetch API.
- Tailwind CSS.

Other libraries may be used by individual authentication, validation, logging, or UI components.

## Internal Dependencies

The Admin module depends on:

- Admin Authentication.
- Admin Authentication Middleware.
- User Model.
- Admin Model.
- Report Model.
- Platform Settings implementation.
- Shared backend error-handling infrastructure.
- Frontend admin API services.

---

# 7. Security Considerations

The Admin module follows these security principles:

- Administrative endpoints are protected by admin authentication middleware.
- Administrative authentication is separated from ordinary user authentication.
- Administrative business logic is implemented on the backend.
- Frontend visibility alone is not treated as authorization.
- User and report information is retrieved through backend services.
- Moderation actions are recorded in moderation history.
- Sensitive information should not be included in unnecessary API responses.
- Platform configuration changes must be processed through authorized backend operations.
- Authentication credentials and secret configuration values must not be exposed to the frontend.
- Error responses should not reveal sensitive internal implementation details.

The exact guarantees of individual authentication mechanisms and permission checks depend on their corresponding implementations.

---

# 8. Assumptions

The current implementation assumes:

- Administrative users are authenticated before accessing protected admin operations.
- Admin APIs are accessed through the configured API base path.
- User and report records are stored in MongoDB.
- Administrative operations use the relevant backend services.
- Dashboard statistics are calculated from backend data.
- Registration charts use user creation timestamps.
- Recent activity is derived from recorded database events.
- Moderation actions are recorded through the moderation implementation.
- Platform settings are managed through the corresponding settings implementation.

---

# 9. Known Limitations

The current implementation has the following considerations:

- Platform activity depends on the events recorded by the backend.
- Historical activity cannot be reconstructed for events that were never recorded.
- The recently seen count depends on the accuracy and update frequency of stored last-seen timestamps.
- The in-memory socket presence mechanism, where used, is not a durable cross-instance presence store.
- Dashboard statistics may not update immediately between refresh intervals.
- Registration history depends on available user creation timestamps.
- The activity feed is limited to the records retrieved for the selected period.
- The exact scope of administrative permissions depends on the implemented authorization rules.

These limitations should be revisited as Nexora's usage and operational requirements grow.

---

# 10. Future Improvements

The Admin module may be extended with:

- Role-based administrative permissions.
- More detailed audit logs.
- Advanced user filtering.
- Exportable user and report records.
- Advanced dashboard analytics.
- Configurable activity retention.
- More granular platform settings.
- Improved real-time activity updates.
- Administrative notification workflows.
- Dashboard date-range customization.
- Dedicated audit history search.
- Monitoring for failed administrative login attempts.

---

# 11. Out of Scope

This document does not describe the internal implementation of:

- Regular user authentication.
- User profile management.
- Profile image management.
- Location management.
- Connection requests.
- Messaging.
- User notification delivery.

These areas are documented independently within their respective modules.

---

# 12. Design Decisions

## Why separate Admin Management from User Management?

User Management allows registered users to maintain their own profile information.

Admin Management provides authorized access to administrative operations and platform-level information.

Separating these responsibilities improves maintainability and reduces the risk of mixing user-facing operations with administrative business logic.

---

## Why use a dedicated admin authentication workflow?

Administrative operations require a separate access boundary from ordinary user functionality.

A dedicated workflow makes it possible to apply administrative authentication and authorization rules independently.

---

## Why use a layered architecture?

Separating routes, middleware, controllers, services, and models prevents administrative business logic from becoming tightly coupled to HTTP request handling.

This improves maintainability and makes individual responsibilities easier to test.

---

## Why derive dashboard statistics from backend data?

Dashboard statistics should represent the current state of Nexora rather than hardcoded sample values.

Calculating statistics through backend services keeps database access and aggregation logic outside the presentation layer.

---

## Why record moderation history?

Moderation history provides a record of administrative actions affecting users.

Recording actions with their associated reasons, administrators, timestamps, and related report information supports traceability and future review.

---

## Why keep platform activity separate from summary statistics?

Summary statistics describe the current platform state, whereas the activity feed describes events that occurred over time.

Separating these responsibilities allows the dashboard to display current totals and historical activity without mixing their meanings.

---

# 13. References

- MongoDB Documentation.
- Mongoose Documentation.
- Express.js Documentation.
- React Documentation.
- Tailwind CSS Documentation.
- OWASP Application Security Verification Standard.
- OWASP API Security Top 10.

---

# 14. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Admin Module Overview documenting the implemented administrative architecture, dashboard, user administration, moderation, settings, and platform activity functionality. |
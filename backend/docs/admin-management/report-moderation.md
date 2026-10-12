> This document describes report management and moderation functionality implemented by Nexora.
> It explains the report data model, report statuses, moderation actions, moderation history, administrative workflows, security considerations, and design decisions.

# Report Management and Moderation

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
| Admin Report Routes | `src/routes/admin/adminReport.routes.js` |
| Admin Report Controller | `src/controllers/admin/adminReport.controller.js` |
| Admin Report Service | `src/services/admin/adminReport.service.js` |
| Report Model | `src/models/report.model.js` |
| User Model | `src/models/user.model.js` |
| Admin Authentication Middleware | `src/middleware/adminAuth.middleware.js` |

The exact moderation-specific component locations should be aligned with the existing implementation if moderation logic is separated into additional services or controllers.

---

# 1. Overview

The Report Management and Moderation functionality enables Nexora administrators to review user reports and take supported moderation actions.

The report system stores information about a report, including the reporter, reported user, reason, current status, administrative notes, account action, reviewing administrator, and review timestamp.

Moderation actions are recorded in the affected user's moderation history.

This provides a persistent record of administrative actions associated with the user.

---

# 2. Objectives

The feature is designed to:

- Support the retrieval and review of submitted reports.
- Maintain report status.
- Associate reports with the relevant users.
- Support administrative review information.
- Support account moderation actions.
- Record moderation history.
- Associate moderation records with an administrator where applicable.
- Record action timestamps and expiration information where applicable.
- Provide a foundation for future moderation auditing.

---

# 3. Responsibilities

The report and moderation functionality is responsible for:

- Representing user-submitted reports.
- Storing report reasons and statuses.
- Associating reports with reporters and reported users.
- Supporting administrative report processing.
- Recording relevant review information.
- Supporting moderation actions.
- Maintaining moderation history.
- Providing report information to administrative interfaces.

---

# 4. Report Data Model

The Report model is defined in:

```text
src/models/report.model.js
```

The model contains the following documented fields.

| Field | Purpose |
|----------|----------|
| `reporter` | Reference to the user who submitted the report |
| `reportedUser` | Reference to the user being reported |
| `reason` | Category describing the report |
| `status` | Current report status |
| `adminNotes` | Administrative notes associated with the report |
| `accountAction` | Account action associated with report processing |
| `reviewedBy` | Reference to the administrator who reviewed the report |
| `reviewedAt` | Timestamp of the review |
| `createdAt` | Report creation timestamp |

The model uses Mongoose timestamps.

The report schema does not use the default version key.

---

# 5. Report Reasons

The Report model supports the following report reason values:

| Value | Description |
|----------|----------|
| `harassment` | Harassment-related report |
| `spam` | Spam-related report |
| `fake_profile` | Suspected fake profile |
| `inappropriate_content` | Inappropriate content |
| `scam` | Suspected scam |
| `other` | Other report reason |

These values are stored as defined enum values.

The administrative interface may present user-friendly labels for these categories without changing the values stored in the database.

---

# 6. Report Statuses

The Report model supports the following statuses:

| Status | Description |
|----------|----------|
| `pending` | Report is awaiting review |
| `reviewing` | Report is under review |
| `resolved` | Report has been resolved |
| `dismissed` | Report has been dismissed |

The default status for a newly created report is `pending`.

The pending report count displayed on the admin dashboard is based on report records with this status.

---

# 7. Report Review Workflow

The general report review workflow is:

```text
User Submits Report
        |
        v
Report Stored in Database
        |
        v
Administrator Retrieves Report
        |
        v
Administrator Reviews Report
        |
        v
Review Decision
        |
        v
Update Report Status
        |
        v
Record Review Information
        |
        v
Apply Moderation Action When Required
```

The exact sequence of status updates and moderation operations is defined by the report service implementation.

A report may be resolved or dismissed according to the administrative decision.

---

# 8. Moderation Actions

The User model records moderation history entries with the following supported action values:

| Action | Purpose |
|----------|----------|
| `warning` | Record a warning |
| `final_warning` | Record a final warning |
| `temporary_suspension` | Record a temporary suspension |
| `permanent_ban` | Record a permanent ban |
| `suspension_expired` | Record suspension expiration |

These actions represent the values supported by the moderation-history schema.

The exact enforcement behavior for each action is determined by the moderation implementation.

---

# 9. Moderation History

Moderation history is stored on the User model.

Each history entry may contain:

| Field | Purpose |
|----------|----------|
| `action` | Moderation action |
| `reason` | Reason for the action |
| `report` | Related Report document, where applicable |
| `admin` | Administrator associated with the action |
| `createdAt` | Action creation timestamp |
| `expiresAt` | Expiration timestamp, where applicable |
| `acknowledgedAt` | Acknowledgement timestamp, where applicable |

This history provides a record of moderation actions associated with the affected user.

The stored timestamps support administrative inspection and the platform activity feed.

---

# 10. Temporary Suspension and Expiration

The moderation-history schema supports temporary suspension records and expiration timestamps.

The `suspension_expired` action can be recorded in moderation history.

The exact expiration-checking mechanism, timing behavior, and account-status transition logic depend on the implemented moderation service.

The existence of an expiration field alone should not be treated as proof that an automatic scheduler or background job is configured.

---

# 11. Account Status

The User model supports the following account status values:

- `active`
- `suspended`
- `banned`

These values represent the account status stored on the user record.

The moderation implementation is responsible for applying the relevant status changes when supported moderation actions are executed.

The exact relationship between report resolution and account status depends on the service logic.

---

# 12. Platform Activity Integration

The Admin Dashboard's recent activity feed includes report and moderation events.

Report events are derived from report records.

Moderation events are derived from recorded moderation-history entries.

The activity feed is intended to display recent events in chronological order.

It is not a substitute for the complete moderation history associated with an individual user.

---

# 13. Validation and Data Integrity

Report and moderation operations must preserve the relationships between:

- Reporter.
- Reported user.
- Report record.
- Reviewing administrator.
- Moderation history.
- Account status.

Incoming values should be validated according to the existing route, middleware, and service implementation.

Unsupported enum values must not be persisted where the schema enforces enum validation.

---

# 14. Security Considerations

- Report review operations must be restricted to authorized administrators.
- Report content should be exposed only to authorized administrative interfaces.
- Administrative notes should not be unnecessarily exposed through unrelated APIs.
- Moderation actions should be processed by the backend.
- Report and user references must be handled using validated identifiers.
- Moderation history should remain associated with the relevant user.
- Administrative identity should be recorded for moderation actions where the schema supports it.
- Error messages should not reveal sensitive internal information.
- Account-status enforcement must be handled by the relevant backend logic rather than relying only on the UI.

---

# 15. Assumptions

The current implementation assumes:

- Reports are stored in MongoDB.
- Report records reference the reporter and reported user.
- Administrative report operations use the Admin Report implementation.
- The User model stores account status and moderation history.
- Moderation history is maintained as embedded user-document data.
- Timestamps are available for report and moderation events.
- Administrative authentication is enforced through the relevant protected routes.

---

# 16. Known Limitations

- Moderation history is embedded within user records.
- Activity feeds contain only a bounded selection of recent events.
- Historical activity cannot be reconstructed if it was never recorded.
- Report handling depends on the implemented administrative review workflow.
- The exact enforcement and expiration behavior depends on the moderation service.
- The schema alone does not establish that an independent audit-log system exists.
- The schema alone does not establish that automated moderation or background expiration jobs exist.

---

# 17. Future Improvements

The feature may be extended with:

- A dedicated moderation audit log.
- Advanced report filters.
- Report prioritization.
- Report assignment.
- Report review timestamps and turnaround analytics.
- Moderation action search.
- Moderation history pagination.
- Configurable suspension durations.
- Automated expiration processing where required.
- Administrative notification workflows.
- Moderation reporting and export.
- More detailed review accountability.

---

# 18. Out of Scope

This document does not describe:

- Regular user authentication.
- Password management.
- Messaging.
- Connection requests.
- Profile editing.
- The full implementation of platform settings.
- The complete admin dashboard layout.

These topics are documented separately.

---

# 19. Design Decisions

## Why store report status?

A report status indicates the current processing state of a report.

It allows the administrative workflow to distinguish reports awaiting review from those being reviewed, resolved, or dismissed.

## Why associate reports with users?

References to the reporter and reported user preserve the relationship between the report and the involved accounts.

## Why maintain moderation history?

Moderation history provides a record of actions taken against a user and stores information such as the reason, administrator, related report, and timestamps.

## Why store moderation history on the User model?

Embedding moderation history makes it possible to retrieve moderation information alongside the relevant user record.

As history grows, the data structure may need to be reassessed for scalability and retention requirements.

## Why distinguish report status from account status?

Report status represents the progress of a report.

Account status represents the current state of a user's account.

Keeping these concepts separate prevents a report's processing state from being confused with the status of the reported account.

---

# 20. References

- MongoDB Documentation.
- Mongoose Documentation.
- Express.js Documentation.
- OWASP API Security Top 10.
- OWASP Logging Cheat Sheet.

---

# 21. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial report and moderation documentation covering report records, report statuses, moderation actions, account status, moderation history, and dashboard activity integration. |
> This document describes the Admin Dashboard implemented by Nexora.
> It explains the dashboard layout, summary statistics, platform activity metrics, registration chart, recent activity feed, settings controls, data retrieval workflow, and design decisions.

# Admin Dashboard

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
| Admin Dashboard | `frontend/src/pages/admin/AdminDashboard.jsx` |
| Admin User API Service | `frontend/src/services/adminUser.service.js` |
| Admin Settings API Service | `frontend/src/services/adminSettings.service.js` |
| Admin User Routes | `src/routes/admin/adminUser.routes.js` |
| Admin User Controller | `src/controllers/admin/adminUser.controller.js` |
| Admin User Service | `src/services/admin/adminUser.service.js` |
| User Model | `src/models/user.model.js` |
| Report Model | `src/models/report.model.js` |

---

# 1. Overview

The Admin Dashboard provides a centralized interface for monitoring the Nexora platform.

It presents summary statistics, registration trends, recent activity, platform settings, and administrator account information.

The dashboard is designed to give administrators an overview of platform usage and administrative workload without requiring them to inspect database records manually.

Dashboard data is retrieved through the backend API services.

---

# 2. Objectives

The dashboard is designed to:

- Present platform statistics in a clear format.
- Display registration trends.
- Show the number of pending reports.
- Provide a recently seen user metric.
- Display recent registration, report, and moderation events.
- Provide quick access to platform settings.
- Display administrator account information.
- Refresh dashboard information periodically.
- Maintain a consistent administrative layout.

---

# 3. Dashboard Layout

The dashboard includes the following primary areas:

1. Administrative sidebar and navigation.
2. Dashboard header.
3. Summary statistic cards.
4. Platform settings controls.
5. Platform Activity section.
6. Admin Account section.

The existing summary cards and settings sections remain independent of the detailed activity interface.

---

# 4. Summary Statistics

The dashboard displays four summary cards.

| Metric | Description |
|----------|----------|
| Total Users | Total number of users reported by the statistics service |
| Completed Profiles | Number of profiles meeting the implementation's completion criteria |
| Discoverable Users | Number of users meeting the implementation's discoverability criteria |
| New Registrations | Number of new registrations returned by the existing statistics service |

The values are retrieved from the admin dashboard statistics endpoint.

```http
GET /api/v1/admin/users/stats
```

The existing statistics response contract is retained.

The precise definition of each count follows the existing backend service implementation.

---

# 5. Platform Activity

The Platform Activity section displays activity data retrieved from the backend.

It includes:

- Recently seen user count.
- Pending report count.
- Registration chart.
- Recent activity feed.
- Seven-day and thirty-day date-range selection.

The activity interface displays loading, error, empty, and successful data states.

This prevents the dashboard from treating an API failure as if the platform had no activity.

---

# 6. Recently Seen Users

The dashboard displays a count based on users whose recorded `lastSeenAt` timestamp falls within the selected activity period.

The value is derived from the user records stored in MongoDB.

The metric describes recorded last-seen information rather than guaranteed real-time online presence.

Its accuracy depends on when the backend updates the `lastSeenAt` field.

---

# 7. Pending Reports

The pending report metric displays the current number of report records whose status is `pending`.

The count is retrieved from the backend.

It represents the current pending-report workload and is not limited to the selected registration-chart period.

Reports that have moved to another status are not included in this count.

---

# 8. Registration Chart

The registration chart displays the number of users registered per day.

Registration events are derived from the `createdAt` timestamps stored in user records.

The dashboard supports two date ranges:

| Range | Description |
|----------|----------|
| 7 days | Daily registration totals for the seven-day view |
| 30 days | Daily registration totals for the thirty-day view |

Each chart item contains:

- Date.
- Registration count.

Example:

```json
{
  "date": "2026-10-12",
  "registrations": 4
}
```

The example is illustrative and does not represent actual platform data.

Days without registrations are represented by zero values when returned by the backend chart data.

The chart is rendered from the API response rather than from hardcoded sample data.

---

# 9. Recent Activity Feed

The recent activity feed displays available recorded platform events.

The supported activity categories include:

| Activity Type | Description |
|----------|----------|
| Registration | A user registration event |
| Report | A report submission event |
| Moderation | A moderation action recorded in user moderation history |

Activity items contain a unique identifier, a type, a display message, and a timestamp.

Report activity may also include the report status.

The feed sorts the retrieved events by timestamp, with newer events displayed first.

The feed is limited to the recent records returned by the backend.

It is not a complete audit log of every action ever performed on Nexora.

---

# 10. Activity Data Retrieval

The dashboard retrieves activity data through the admin user API service.

The endpoint is:

```http
GET /api/v1/admin/users/activity?days=7
```

The supported date ranges are seven days and thirty days.

The response includes the metrics and event lists required by the Platform Activity section.

The dashboard refreshes activity data periodically, and changing the selected date range triggers a new activity request.

---

# 11. Loading, Error, and Empty States

The dashboard supports different display states.

## Loading State

A loading indicator is displayed while the activity API request is in progress.

## Error State

If activity data cannot be retrieved, the dashboard displays an error state rather than treating the failure as an empty activity list.

## Empty State

If the API succeeds but returns no activity for the selected period, the dashboard displays an appropriate empty-state message.

## Successful State

When activity data is available, the dashboard displays the metrics, chart, and recent events.

---

# 12. Platform Settings

The dashboard includes the following settings sections:

- Maintenance Mode.
- New User Registration.

These controls are part of the platform settings functionality and use the corresponding settings service.

Their persistence and update behavior are defined by the Admin Settings implementation.

The dashboard does not replace the backend's responsibility for validating and applying setting changes.

---

# 13. Admin Account

The dashboard includes an Admin Account section.

This section provides administrator account information within the existing dashboard layout.

It remains separate from the Platform Activity section so that account information and platform monitoring are not mixed together.

---

# 14. Refresh Strategy

Dashboard data is refreshed periodically.

The existing dashboard refresh mechanism retrieves summary statistics and settings.

The activity section uses its own data retrieval workflow and periodic refresh interval.

Separating these requests allows the activity period to change without changing the existing summary statistics response.

---

# 15. Security Considerations

- Dashboard data is retrieved through the administrative API.
- Protected administrative endpoints require the configured admin authentication.
- Sensitive account information must not be exposed unnecessarily.
- Dashboard statistics must be calculated by the backend.
- Activity messages should avoid exposing private report descriptions or internal administrative notes.
- Platform settings must be changed through authorized backend operations.
- The dashboard must not treat hidden UI controls as a substitute for backend authorization.

---

# 16. Assumptions

The current dashboard assumes:

- The administrator is authenticated.
- The statistics endpoint returns the expected summary fields.
- The activity endpoint returns the expected activity structure.
- User registration timestamps are available.
- Report records contain creation timestamps and status.
- Moderation history contains recorded action timestamps.
- Settings are retrieved through the existing settings API.
- The backend is available when the dashboard requests fresh data.

---

# 17. Known Limitations

- Activity data cannot include events that were never recorded.
- The recent activity feed contains only a bounded selection of recent records.
- The last-seen count does not necessarily represent currently connected users.
- Dashboard values may be stale between refresh intervals.
- The registration chart is based on user creation timestamps.
- The activity view does not independently provide a full administrative audit trail.
- Activity data depends on successful backend requests.

---

# 18. Future Improvements

The dashboard may be extended with:

- More chart types.
- Registration comparisons between periods.
- User growth percentages.
- Report resolution statistics.
- Moderation action summaries.
- Real-time dashboard updates.
- Exportable reports.
- Custom date ranges.
- Dedicated audit-log search.
- Configurable refresh intervals.
- More detailed operational metrics.

---

# 19. Out of Scope

This document does not describe:

- The internal implementation of admin authentication.
- Detailed user listing behavior.
- Report review workflows.
- Individual moderation action implementation.
- The persistence implementation for platform settings.

These topics are documented separately.

---

# 20. Design Decisions

## Why use backend-generated statistics?

Backend-generated statistics reflect the stored application data and avoid relying on client-side calculations over incomplete records.

## Why use user creation timestamps for registration charts?

The `createdAt` field provides a persisted timestamp for each user record.

It enables daily registration totals to be calculated from actual registration data.

## Why separate current statistics from historical activity?

Summary statistics represent counts, while the activity feed represents recorded events.

Keeping them separate makes their meanings clear and allows them to be retrieved independently.

## Why provide seven-day and thirty-day views?

These ranges provide short-term and broader registration trends without requiring administrators to configure arbitrary dates.

## Why provide explicit error and empty states?

An empty result and a failed API request are different situations.

Displaying them separately prevents an API failure from being mistaken for an absence of activity.

---

# 21. References

- React Documentation.
- MongoDB Aggregation Documentation.
- Mongoose Documentation.
- Express.js Documentation.
- Tailwind CSS Documentation.

---

# 22. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Admin Dashboard documentation covering summary statistics, platform activity, registration charts, recent activity, settings, and administrator account layout. |
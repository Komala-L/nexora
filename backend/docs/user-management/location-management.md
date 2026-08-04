> This document describes the location management feature implemented by Nexora.
> It explains the location update workflow, GeoJSON storage format, geospatial indexing strategy, security considerations, and design decisions used to support location-based user discovery.

# Location Management

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | User Management |
| Document Type | Feature Design |
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

The Location Management feature allows authenticated users to update and maintain their current geographical location.

Location data serves as the foundation for Nexora's nearby user discovery feature. Every authenticated user may update their latest location, which is stored using MongoDB's GeoJSON format to support efficient geospatial queries.

Only the user's most recent location is maintained.

---

# 2. Objectives

The location management feature is designed to:

- Store each user's current geographical location.
- Support efficient nearby user discovery.
- Enable MongoDB geospatial queries.
- Maintain a standardized location format.
- Support future location-based social features.

---

# 3. Supported Operations

The planned implementation supports the following operation.

| Operation | Description |
|----------|-------------|
| Update Location | Update the authenticated user's current location |

Future versions may support additional location-related features.

---

# 4. Location Update Workflow

The location update process follows the workflow below.

```
Authenticated User

↓

Grant Location Permission

↓

Client Retrieves Coordinates

↓

Location Update Request

↓

Request Validation

↓

Convert to GeoJSON

↓

Update User Document

↓

Return Updated Profile
```

Only the latest location is stored.

---

# 5. Location Storage Format

Nexora stores user locations using MongoDB's GeoJSON Point format.

Example:

```json
{
    "type": "Point",
    "coordinates": [
        77.5946,
        12.9716
    ]
}
```

Coordinates are stored in the following order:

```
[ longitude, latitude ]
```

This ordering follows the GeoJSON specification used by MongoDB.

---

# 6. Why GeoJSON?

GeoJSON is the standard location format supported by MongoDB for geospatial data.

Using GeoJSON provides several advantages:

- Native MongoDB support.
- Efficient geospatial indexing.
- Radius-based searches.
- Compatibility with future mapping services.
- Standardized location representation.

GeoJSON allows Nexora to efficiently identify nearby users without requiring complex calculations in application code.

---

# 7. Geospatial Indexing

The location field is indexed using MongoDB's `2dsphere` index.

This index enables efficient geospatial operations such as:

- Radius searches.
- Nearby user discovery.
- Distance calculations.
- Geographical filtering.

Without a geospatial index, nearby user queries would require scanning every user document, resulting in poor performance as the application grows.

---

# 8. Nearby User Dependency

Nearby User Discovery depends directly on the Location Management feature.

The location stored in each user profile will later be used to:

- Find nearby users.
- Calculate distances.
- Filter users within a specified radius.
- Support future location-based recommendations.

Accurate location management is therefore a prerequisite for Nexora's primary application feature.

---

# 9. Validation Strategy

Every location update is validated before persistence.

Validation includes:

- Latitude range validation.
- Longitude range validation.
- GeoJSON structure validation.
- Required coordinate verification.
- Coordinate data type validation.

Invalid requests are rejected before updating the database.

---

# 10. Security Considerations

The location management feature follows these security principles.

- Only authenticated users may update their own location.
- Invalid coordinates are rejected.
- User locations are never modified by other users.
- Internal geospatial processing remains hidden from clients.
- Location updates occur only through authorized API endpoints.

---

# 11. Assumptions

The current implementation assumes:

- Users grant location permission to the client application.
- Every user has only one active location.
- New location updates replace previous coordinates.
- Coordinates are supplied by the client application.

---

# 12. Known Limitations

The current implementation intentionally accepts the following limitations.

- Location history is not maintained.
- Background location tracking is not supported.
- Manual location selection is not available.
- Distance caching has not been implemented.
- Reverse geocoding is not supported.
- Location privacy protection has not yet been implemented.

These limitations are acceptable for the current development phase.

---

# 13. Future Improvements

The location management feature may be extended with:

- Location history.
- Manual location selection.
- Reverse geocoding.
- Region-based recommendations.
- Automatic background updates.
- Live location sharing.
- Distance caching.
- Privacy controls for location visibility.
- Location obfuscation for privacy protection.

---

# 14. Out of Scope

This document intentionally does not cover:

- Nearby user discovery.
- Friend recommendations.
- Mapping services.
- Route navigation.
- Real-time location tracking.

These topics are documented separately within their respective modules.

---

# 15. Design Decisions

## Why store only the latest location?

The current version of Nexora requires only the user's latest position for nearby user discovery.

Maintaining historical locations would increase storage requirements without providing immediate application value.

---

## Why use GeoJSON?

GeoJSON is the standard geospatial format supported by MongoDB.

It enables native geospatial indexing and efficient radius-based queries while remaining compatible with future mapping services.

---

## Why use a geospatial index?

A `2dsphere` index allows MongoDB to perform efficient location-based queries without scanning every user document, significantly improving scalability as the number of users increases.

---

## Why separate location management from nearby discovery?

Location Management is responsible only for storing user locations.

Nearby Discovery is responsible for using those locations to identify nearby users.

Separating these responsibilities improves maintainability and follows the principle of separation of concerns.

---

## Why separate location storage from location privacy?

Location Management is responsible for storing accurate geographical coordinates.

Location privacy is applied later by the Nearby User Discovery module before location information is shared with other users.

Separating storage from privacy ensures accurate geospatial queries while protecting users from exposing their exact location.

---

# 16. References

- MongoDB Geospatial Queries Documentation
- MongoDB GeoJSON Documentation
- GeoJSON Specification (RFC 7946)
- Mongoose Documentation
- MongoDB 2dsphere Index Documentation

---

# 17. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Location Management Design |
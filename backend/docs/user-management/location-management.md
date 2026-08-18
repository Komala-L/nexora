> This document describes the location management feature implemented by Nexora.
> It explains the location update workflow, GeoJSON storage format, geospatial indexing strategy, security considerations, and design decisions used to support location-based user discovery.

# Location Management

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

The Location Management feature allows authenticated users to update and maintain their current geographical location.

Location data serves as the foundation for Nexora's nearby user discovery feature. User locations are stored using MongoDB's GeoJSON format and indexed using a `2dsphere` index to support efficient geospatial queries.

Nexora maintains two location representations:

- `location` — the user's actual geographical coordinates.
- `discoveryLocation` — the coordinates used for nearby-user discovery.

For users whose location requires additional privacy protection, the discovery location is intentionally obfuscated so that other users cannot determine their exact geographical position.

The actual location remains available internally for accurate application functionality, while the protected discovery location is used when performing location-based discovery.

---

# 2. Objectives

The location management feature is designed to:

- Store each user's current geographical location.
- Maintain a protected discovery location when required.
- Support efficient nearby user discovery.
- Enable MongoDB geospatial queries.
- Maintain a standardized GeoJSON location format.
- Protect users from exposing their exact geographical location.
- Support future location-based social features.

---

# 3. Supported Operations

The implemented feature supports the following operation.

| Operation | Description |
|----------|-------------|
| Update Location | Update the authenticated user's current location |

Future versions may support additional location-related features.

---

# 4. Location Update Workflow

The location update process follows the workflow below.

```text
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

Store Actual Location

↓

Generate Protected Discovery Location

↓

Update User Document

↓

Return Updated Profile
```
The actual coordinates are stored in the location field.

For users requiring location protection, a randomized discoveryLocation is generated from the actual location.

The discovery location is then used for nearby-user queries so that the user's exact geographical position is not directly exposed through location-based discovery.

---

# 5. Location Storage Format

Nexora stores geographical information using MongoDB's GeoJSON `Point` format.

Each user may contain two location fields:

### Actual Location

```json
{
    "type": "Point",
    "coordinates": [
        77.5946,
        12.9716
    ]
}
```
### Discovery Location

```json
{
    "type": "Point",
    "coordinates": [
        77.5722,
        12.9896
    ]
}
```

Coordinates are stored in the following order:

```
[ longitude, latitude ]
```
The location field represents the user's actual coordinates.

The discoveryLocation field represents the coordinates used for nearby-user discovery and may be intentionally offset to provide location privacy.

---

# 6. Location Privacy and Obfuscation

Nexora does not expose a protected user's exact geographical location during nearby-user discovery.

For users requiring additional location privacy, the system generates a randomized discovery location around the user's actual coordinates.

The generated offset is intentionally randomized so that repeated observations do not reveal a predictable pattern.

The protection mechanism is designed so that:

- The actual location remains stored internally.
- The discovery location is different from the actual location when protection is required.
- The offset is randomized for each user.
- No fixed offset pattern is used.
- Nearby-user discovery uses the protected discovery location.
- Exact geographical coordinates are not returned to other users.

This approach provides a balance between location-based discovery and user privacy.

---

# 7. Why GeoJSON?

GeoJSON is the standard location format supported by MongoDB for geospatial data.

Using GeoJSON provides several advantages:

- Native MongoDB support.
- Efficient geospatial indexing.
- Radius-based searches.
- Compatibility with future mapping services.
- Standardized location representation.

GeoJSON allows Nexora to efficiently identify nearby users without requiring complex calculations in application code.

---

# 8. Geospatial Indexing

The location field is indexed using MongoDB's `2dsphere` index.

This index enables efficient geospatial operations such as:

- Radius searches.
- Nearby user discovery.
- Distance calculations.
- Geographical filtering.

Without a geospatial index, nearby user queries would require scanning every user document, resulting in poor performance as the application grows.

---

# 9. Nearby User Dependency

Nearby User Discovery depends directly on the Location Management feature.

The `discoveryLocation` stored for each user is used to:

- Find nearby users.
- Perform geospatial queries.
- Filter users within the configured discovery radius.
- Support location-based recommendations.

Nearby-user queries operate on `discoveryLocation` rather than directly exposing the user's actual `location`.

This allows Nexora to provide location-based discovery while maintaining location privacy.

---

# 10. Validation Strategy

Every location update is validated before persistence.

Validation includes:

- Latitude range validation.
- Longitude range validation.
- GeoJSON structure validation.
- Required coordinate verification.
- Coordinate data type validation.
- Valid coordinate ordering.

Invalid requests are rejected before updating the database.

Protected discovery coordinates are generated by the backend rather than accepted directly from the client.

---

# 11. Security Considerations

The location management feature follows these security principles.

- Only authenticated users may update their own location.
- Invalid coordinates are rejected.
- Users cannot directly modify another user's location.
- Actual location data remains under backend control.
- Discovery locations are generated by the backend.
- Clients cannot directly submit a custom discovery location.
- Exact location coordinates are not exposed through nearby-user discovery.
- Geospatial processing remains hidden from clients.
- Location updates occur only through authorized API endpoints.

---

# 12. Assumptions

The current implementation assumes:

- Users grant location permission to the client application.
- Every user has one active actual location.
- New location updates replace the previous actual coordinates.
- Coordinates are supplied by the client application.
- Discovery coordinates are generated by the backend.
- Nearby-user discovery operates using `discoveryLocation`.

---

# 13. Known Limitations

The current implementation intentionally accepts the following limitations.

- Location history is not maintained.
- Background location tracking is not supported.
- Manual location selection is not available.
- Distance caching has not been implemented.
- Reverse geocoding is not supported.
- Advanced user-controlled location privacy settings are not available.
- Live location sharing is not implemented.

---

# 14. Future Improvements

The location management feature may be extended with:

- Location history.
- Manual location selection.
- Reverse geocoding.
- Region-based recommendations.
- Automatic background updates.
- Live location sharing.
- Distance caching.
- User-configurable location privacy controls.
- Configurable discovery radius.
- More advanced location obfuscation strategies.

---

# 15. Out of Scope

This document intentionally does not cover:

- Nearby user discovery.
- Friend recommendations.
- Mapping services.
- Route navigation.
- Real-time location tracking.

These topics are documented separately within their respective modules.

---

# 1.6 Design Decisions

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

Location Management is responsible for maintaining accurate geographical coordinates.

Location privacy is applied when generating the discovery location used by nearby-user discovery.

Keeping the actual location separate from the protected discovery location allows Nexora to maintain accurate internal geospatial data while preventing other users from determining a protected user's exact location.

---

## Why maintain both `location` and `discoveryLocation`?

The actual location is required internally for maintaining accurate geographical information.

However, using the exact location directly for discovery could compromise user privacy.

Nexora therefore maintains:

- `location` for the user's actual coordinates.
- `discoveryLocation` for privacy-aware nearby-user discovery.

This separation allows the application to preserve accurate internal location data while using protected coordinates for social discovery.

---

## Why randomize the discovery location?

Using a fixed offset would create a predictable pattern that could potentially be used to estimate a user's actual location.

Nexora therefore generates a randomized offset for protected discovery locations.

The randomized approach makes the protection less predictable while still allowing the user to participate in nearby-user discovery.

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
| 0.2 | Updated documentation to reflect the implemented location API, GeoJSON storage, discoveryLocation, geospatial discovery, and randomized location protection |
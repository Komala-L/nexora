# Connection Management API

## Document Information

| Property         | Value                 |
| ---------------- | --------------------- |
| Project          | Nexora                |
| Module           | Connection Management |
| Document Type    | API Specification     |
| Document Version | 0.2                   |
| Status           | Active                |
| Review Status    | Approved              |
| Author           | Komala L              |
| Last Updated     | 31 August 2026        |

---

# 1. API Overview

The Connection Management API provides authenticated users with endpoints to create, manage, and retrieve user connections.

The API supports:

* Sending connection requests.
* Accepting connection requests.
* Rejecting connection requests.
* Cancelling outgoing connection requests.
* Viewing accepted connections.
* Viewing received pending requests.
* Viewing sent pending requests.
* Removing accepted connections.

Detailed relationship rules, state transitions, duplicate-request handling, and database design are documented in the supporting Connection Management documents.

---

# 2. Base URL

```text
/api/v1/connections
```

All endpoints require authentication unless explicitly stated otherwise.

---

# 3. Authentication

Connection Management endpoints require an authenticated user.

The authenticated user is established by the authentication middleware and is available through:

```text
req.user._id
```

The client must not provide the authenticated user's identity as the requester.

Unauthenticated requests are rejected by the authentication middleware.

---

# 4. API Summary

| # | Method | Endpoint                                            | Purpose                       |
| - | ------ | --------------------------------------------------- | ----------------------------- |
| 1 | POST   | `/api/v1/connections/requests/:userId`              | Send connection request       |
| 2 | PATCH  | `/api/v1/connections/requests/:connectionId/accept` | Accept connection request     |
| 3 | PATCH  | `/api/v1/connections/requests/:connectionId/reject` | Reject connection request     |
| 4 | DELETE | `/api/v1/connections/requests/:connectionId`        | Cancel outgoing request       |
| 5 | GET    | `/api/v1/connections`                               | Get accepted connections      |
| 6 | GET    | `/api/v1/connections/requests/received`             | Get received pending requests |
| 7 | GET    | `/api/v1/connections/requests/sent`                 | Get sent pending requests     |
| 8 | DELETE | `/api/v1/connections/:connectionId`                 | Remove accepted connection    |

---

# 5. API 1 — Send Connection Request

## Endpoint

```http
POST /api/v1/connections/requests/:userId
```

## Authentication

Required.

## Purpose

Creates a pending connection request from the authenticated user to the specified user.

## Path Parameters

| Parameter | Type            | Required | Description                          |
| --------- | --------------- | -------- | ------------------------------------ |
| `userId`  | String/ObjectId | Yes      | ID of the user receiving the request |

## Request Body

No request body is required.

## Success Response

```text
201 Created
```

Example:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Connection request sent successfully",
  "data": {
    "connection": {
      "_id": "...",
      "requester": "...",
      "recipient": "...",
      "pairKey": "...",
      "status": "pending",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

## Possible Errors

| Status | Condition                            |
| ------ | ------------------------------------ |
| `400`  | Invalid request or self-request      |
| `401`  | Authentication required              |
| `404`  | Target user not found                |
| `409`  | Existing or conflicting relationship |

---

# 6. API 2 — Accept Connection Request

## Endpoint

```http
PATCH /api/v1/connections/requests/:connectionId/accept
```

## Authentication

Required.

## Purpose

Accepts a pending connection request received by the authenticated user.

## Path Parameters

| Parameter      | Type            | Required | Description                  |
| -------------- | --------------- | -------- | ---------------------------- |
| `connectionId` | String/ObjectId | Yes      | ID of the connection request |

## Request Body

No request body is required.

## Authorization

Only the recipient of the pending request can accept it.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Connection request accepted successfully",
  "data": {
    "connection": {
      "_id": "...",
      "requester": "...",
      "recipient": "...",
      "status": "accepted",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

## Possible Errors

| Status | Condition                    |
| ------ | ---------------------------- |
| `401`  | Authentication required      |
| `403`  | User is not the recipient    |
| `404`  | Connection request not found |
| `409`  | Request is not pending       |

---

# 7. API 3 — Reject Connection Request

## Endpoint

```http
PATCH /api/v1/connections/requests/:connectionId/reject
```

## Authentication

Required.

## Purpose

Rejects a pending connection request received by the authenticated user.

Rejected requests are removed rather than persisted as a permanent relationship state.

## Path Parameters

| Parameter      | Type            | Required | Description                  |
| -------------- | --------------- | -------- | ---------------------------- |
| `connectionId` | String/ObjectId | Yes      | ID of the connection request |

## Request Body

No request body is required.

## Authorization

Only the recipient of the pending request can reject it.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Connection request rejected successfully"
}
```

## Possible Errors

| Status | Condition                    |
| ------ | ---------------------------- |
| `401`  | Authentication required      |
| `403`  | User is not the recipient    |
| `404`  | Connection request not found |
| `409`  | Request is not pending       |

---

# 8. API 4 — Cancel Connection Request

## Endpoint

```http
DELETE /api/v1/connections/requests/:connectionId
```

## Authentication

Required.

## Purpose

Cancels a pending connection request sent by the authenticated user.

## Path Parameters

| Parameter      | Type            | Required | Description                          |
| -------------- | --------------- | -------- | ------------------------------------ |
| `connectionId` | String/ObjectId | Yes      | ID of the pending connection request |

## Request Body

No request body is required.

## Authorization

Only the requester can cancel a pending request.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Connection request cancelled successfully"
}
```

## Possible Errors

| Status | Condition                    |
| ------ | ---------------------------- |
| `401`  | Authentication required      |
| `403`  | User is not the requester    |
| `404`  | Connection request not found |
| `409`  | Request is not pending       |

---

# 9. API 5 — Get User Connections

## Endpoint

```http
GET /api/v1/connections
```

## Authentication

Required.

## Purpose

Returns the accepted connections of the authenticated user.

## Query Parameters

| Parameter | Type    | Required | Default | Description                |
| --------- | ------- | -------- | ------- | -------------------------- |
| `page`    | Integer | No       | `1`     | Page number                |
| `limit`   | Integer | No       | `20`    | Number of results per page |

Maximum allowed `limit`:

```text
50
```

## Filtering

Only accepted connections involving the authenticated user are returned.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Connections fetched successfully",
  "data": {
    "connections": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## Pagination

Pagination metadata contains:

* `page`
* `limit`
* `total`
* `totalPages`

---

# 10. API 6 — Get Received Connection Requests

## Endpoint

```http
GET /api/v1/connections/requests/received
```

## Authentication

Required.

## Purpose

Returns pending connection requests received by the authenticated user.

## Query Parameters

| Parameter | Type    | Required | Default | Description                |
| --------- | ------- | -------- | ------- | -------------------------- |
| `page`    | Integer | No       | `1`     | Page number                |
| `limit`   | Integer | No       | `20`    | Number of results per page |

Maximum allowed `limit`:

```text
50
```

## Filtering

The endpoint returns requests where:

```text
recipient = authenticated user
status = pending
```

## Sorting

Requests are returned with the newest requests first:

```text
createdAt: -1
```

## Requester Population

The requester is populated with the following fields:

```text
name
profilePic
bio
interests
```

Sensitive user information is not populated.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Received connection requests fetched successfully",
  "data": {
    "requests": [
      {
        "_id": "...",
        "requester": {
          "_id": "...",
          "name": "...",
          "profilePic": "...",
          "bio": "...",
          "interests": []
        },
        "recipient": "...",
        "pairKey": "...",
        "status": "pending",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

# 11. API 7 — Get Sent Connection Requests

## Endpoint

```http
GET /api/v1/connections/requests/sent
```

## Authentication

Required.

## Purpose

Returns pending connection requests sent by the authenticated user.

## Query Parameters

| Parameter | Type    | Required | Default | Description                |
| --------- | ------- | -------- | ------- | -------------------------- |
| `page`    | Integer | No       | `1`     | Page number                |
| `limit`   | Integer | No       | `20`    | Number of results per page |

Maximum allowed `limit`:

```text
50
```

## Filtering

The endpoint returns requests where:

```text
requester = authenticated user
status = pending
```

## Sorting

Requests are returned with the newest requests first:

```text
createdAt: -1
```

## Recipient Population

The recipient is populated with the following fields:

```text
name
profilePic
bio
interests
```

Sensitive user information is not populated.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sent connection requests fetched successfully",
  "data": {
    "requests": [
      {
        "_id": "...",
        "requester": "...",
        "recipient": {
          "_id": "...",
          "name": "...",
          "profilePic": "...",
          "bio": "...",
          "interests": []
        },
        "pairKey": "...",
        "status": "pending",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

# 12. API 8 — Remove Accepted Connection

## Endpoint

```http
DELETE /api/v1/connections/:connectionId
```

## Authentication

Required.

## Purpose

Removes an existing accepted connection between the authenticated user and another user.

## Path Parameters

| Parameter      | Type            | Required | Description                   |
| -------------- | --------------- | -------- | ----------------------------- |
| `connectionId` | String/ObjectId | Yes      | ID of the accepted connection |

## Request Body

No request body is required.

## Authorization

Either participant in the accepted connection can remove it.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Connection removed successfully"
}
```

## Possible Errors

| Status | Condition                  |
| ------ | -------------------------- |
| `401`  | Authentication required    |
| `403`  | User is not a participant  |
| `404`  | Connection not found       |
| `409`  | Connection is not accepted |

---

# 13. Pagination

Pagination is supported by:

```text
GET /api/v1/connections
GET /api/v1/connections/requests/received
GET /api/v1/connections/requests/sent
```

## Parameters

```text
page
limit
```

## Defaults

```text
page = 1
limit = 20
```

## Maximum Limit

```text
50
```

## Response Metadata

Paginated responses include:

```text
page
limit
total
totalPages
```

If a valid page contains no records, the API returns a successful response with an empty result array.

---

# 14. Validation

Pagination query parameters are validated before the request reaches the controller.

Invalid values include:

```text
page <= 0
page is non-numeric
page is decimal

limit <= 0
limit > 50
limit is non-numeric
limit is decimal
```

Invalid query parameters result in:

```text
400 Bad Request
```

Path parameters such as `userId` and `connectionId` are also validated according to the applicable validation rules.

---

# 15. Common Error Responses

Connection Management APIs use Nexora's standard API error response structure.

Common status codes:

| Status Code | Meaning                                             |
| ----------- | --------------------------------------------------- |
| `400`       | Invalid request or validation failure               |
| `401`       | Authentication required                             |
| `403`       | Authenticated user is not authorized                |
| `404`       | Requested user or connection not found              |
| `409`       | Relationship conflict or invalid relationship state |
| `500`       | Unexpected server error                             |

Example:

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Connection request already exists"
}
```

The exact error message depends on the operation and failure condition.

---

# 16. Response Data Exposure

Connection APIs return only the user information required by the client.

For populated request users, the supported fields are:

```text
name
profilePic
bio
interests
```

Sensitive fields such as the following are not exposed:

```text
email
password
refreshToken
location
discoveryLocation
```

---

# 17. Related Documents

| Document              | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `overview.md`         | Connection Management module overview        |
| `data-model.md`       | Connection schema and database design        |
| `state-machine.md`    | Relationship lifecycle and state transitions |
| `request-strategy.md` | Duplicate and reverse-request handling       |

---

# 18. Revision History

| Version | Description                                                                   |
| ------- | ----------------------------------------------------------------------------- |
| 0.1     | Initial Connection Management API documentation                               |
| 0.2     | Updated API specification for all implemented Connection Management endpoints |

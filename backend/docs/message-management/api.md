# Messaging API

## Document Information

| Property         | Value             |
| ---------------- | ----------------- |
| Project          | Nexora            |
| Module           | Message Management|
| Document Type    | API Specification |
| Document Version | 0.1               |
| Status           | Active            |
| Review Status    | Approved          |
| Author           | Komala L          |
| Last Updated     | 14 September 2026 |

---

# 1. API Overview

The Messaging API provides authenticated users with endpoints to create conversations and exchange messages with users they are connected with.

The API supports:

* Creating a conversation with an accepted connection.
* Viewing the authenticated user's conversations.
* Retrieving a specific conversation.
* Sending messages.
* Retrieving messages from a conversation.
* Pagination for conversation and message lists.

Conversation creation is restricted to accepted connections.

Message operations are restricted to conversation participants.

Detailed conversation and message behavior are documented in the supporting Messaging documents.

---

# 2. Base Paths

Conversation endpoints use:

```text
/api/v1/conversations
```

Message endpoints use:

```text
/api/v1/messages
```

All implemented endpoints require authentication.

---

# 3. Authentication

All Messaging API endpoints require an authenticated user.

The authenticated user is determined by Nexora's authentication middleware.

Unauthenticated requests are rejected.

---

# 4. API Summary

| # | Method | Endpoint                                | Purpose                                               |
| - | ------ | --------------------------------------- | ----------------------------------------------------- |
| 1 | POST   | `/api/v1/conversations/:userId`         | Create or retrieve conversation with a connected user |
| 2 | GET    | `/api/v1/conversations`                 | Get authenticated user's conversations                |
| 3 | GET    | `/api/v1/conversations/:conversationId` | Get a specific conversation                           |
| 4 | POST   | `/api/v1/messages/:conversationId`      | Send a message                                        |
| 5 | GET    | `/api/v1/messages/:conversationId`      | Get conversation messages                             |

All endpoints require authentication.

---

# 5. API 1 — Create Conversation

## Endpoint

```http
POST /api/v1/conversations/:userId
```

## Authentication

Required.

## Purpose

Creates a conversation between the authenticated user and the specified user.

The target user must have an accepted Connection with the authenticated user.

If a conversation already exists for the user pair, the existing conversation is returned instead of creating another conversation.

## Path Parameters

| Parameter | Type            | Required | Description                                          |
| --------- | --------------- | -------- | ---------------------------------------------------- |
| `userId`  | String/ObjectId | Yes      | ID of the user with whom the conversation is created |

## Request Body

No request body is required.

## Authorization

The authenticated user must have an accepted Connection with the target user.

The Conversation service verifies the relationship before conversation creation.

## Success Response

```text
201 Created
```

Example:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Conversation created successfully",
  "data": {
    "conversation": {
      "_id": "...",
      "participants": [
        "...",
        "..."
      ],
      "pairKey": "...",
      "lastMessageAt": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

If a conversation already exists, the existing conversation is returned.

## Possible Errors

| Status | Condition                                              |
| ------ | ------------------------------------------------------ |
| `400`  | User attempts to create a conversation with themselves |
| `401`  | Authentication required                                |
| `403`  | Users do not have an accepted connection               |
| `404`  | Target user not found                                  |
| `500`  | Unexpected server error                                |

---

# 6. API 2 — Get User Conversations

## Endpoint

```http
GET /api/v1/conversations
```

## Authentication

Required.

## Purpose

Returns conversations belonging to the authenticated user.

Only conversations where the authenticated user is a participant are returned.

## Query Parameters

| Parameter | Type    | Required | Default | Description                      |
| --------- | ------- | -------- | ------- | -------------------------------- |
| `page`    | Integer | No       | `1`     | Page number                      |
| `limit`   | Integer | No       | `20`    | Number of conversations per page |

The endpoint uses Nexora's existing connection pagination validation schema.

## Filtering

Returns conversations belonging to the authenticated user.

Only conversations containing the authenticated user's ID are returned.

## Sorting

Conversations are returned in descending order of:

- lastMessageAt
- updatedAt

## Participant Population

Conversation participants are populated with:

```text
_id
name
profilePic
```

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Conversations fetched successfully",
  "data": {
    "conversations": [
      {
        "_id": "...",
        "participants": [
          {
            "_id": "...",
            "name": "...",
            "profilePic": "..."
          }
        ],
        "pairKey": "...",
        "lastMessageAt": "...",
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

# 7. API 3 — Get Specific Conversation

## Endpoint

```http
GET /api/v1/conversations/:conversationId
```

## Authentication

Required.

## Purpose

Returns a specific conversation accessible to the authenticated user.

## Path Parameters

| Parameter        | Type            | Required | Description            |
| ---------------- | --------------- | -------- | ---------------------- |
| `conversationId` | String/ObjectId | Yes      | ID of the conversation |

## Request Body

No request body is required.

## Authorization

The authenticated user must be one of the conversation participants.

The service checks the participants stored in the Conversation document.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Conversation fetched successfully",
  "data": {
    "conversation": {
      "_id": "...",
      "participants": [
        {
          "_id": "...",
          "name": "...",
          "profilePic": "..."
        }
      ],
      "pairKey": "...",
      "lastMessageAt": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

## Possible Errors

| Status | Condition                               |
| ------ | --------------------------------------- |
| `401`  | Authentication required                 |
| `403`  | Authenticated user is not a participant |
| `404`  | Conversation not found                  |
| `500`  | Unexpected server error                 |

---

# 8. API 4 — Send Message

## Endpoint

```http
POST /api/v1/messages/:conversationId
```

## Authentication

Required.

## Purpose

Creates a new message in an existing conversation.

Only participants of the conversation can send messages.

## Path Parameters

| Parameter        | Type            | Required | Description            |
| ---------------- | --------------- | -------- | ---------------------- |
| `conversationId` | String/ObjectId | Yes      | ID of the conversation |

## Request Body

```json
{
  "content": "Hello"
}
```

## Request Fields

| Field     | Type   | Required | Validation                                            |
| --------- | ------ | -------- | ----------------------------------------------------- |
| `content` | String | Yes      | Trimmed, minimum 1 character, maximum 2000 characters |

The request body is strict.

Unexpected fields are rejected by the validation schema.

## Validation

The message content is validated using:

```text
src/validations/message.validation.js
```

The following values are invalid:

```text
empty string
whitespace-only string
content longer than 2000 characters
non-string content
unexpected request fields
```

## Sender Identity

The sender is determined from the authenticated user.

The client cannot specify another user as the sender.

## Authorization

The authenticated user must be a participant in the conversation.

## Success Response

```text
201 Created
```

Example:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "...",
      "conversation": "...",
      "sender": {
        "_id": "...",
        "name": "...",
        "profilePic": "..."
      },
      "content": "Hello",
      "read": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

## Possible Errors

| Status | Condition                              |
| ------ | -------------------------------------- |
| `400`  | Invalid message content                |
| `401`  | Authentication required                |
| `403`  | User is not a conversation participant |
| `404`  | Conversation not found                 |
| `500`  | Unexpected server error                |

---

# 9. API 5 — Get Conversation Messages

## Endpoint

```http
GET /api/v1/messages/:conversationId
```

## Authentication

Required.

## Purpose

Returns messages belonging to a specific conversation.

Only conversation participants can retrieve its messages.

## Path Parameters

| Parameter        | Type            | Required | Description            |
| ---------------- | --------------- | -------- | ---------------------- |
| `conversationId` | String/ObjectId | Yes      | ID of the conversation |

## Query Parameters

| Parameter | Type    | Required | Default | Description                 |
| --------- | ------- | -------- | ------- | --------------------------- |
| `page`    | Integer | No       | `1`     | Page number                 |
| `limit`   | Integer | No       | `20`    | Number of messages per page |

The endpoint uses Nexora's existing connection pagination validation schema.

## Filtering

Only messages belonging to the requested conversation are returned.

## Sorting

Messages are returned from oldest to newest.

## Sender Population

The sender is populated with:

```text
_id
name
profilePic
```

Sensitive User fields are not returned.

## Success Response

```text
200 OK
```

Example:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Messages fetched successfully",
  "data": {
    "messages": [
      {
        "_id": "...",
        "conversation": "...",
        "sender": {
          "_id": "...",
          "name": "...",
          "profilePic": "..."
        },
        "content": "Hello",
        "read": false,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

## Possible Errors

| Status | Condition                              |
| ------ | -------------------------------------- |
| `401`  | Authentication required                |
| `403`  | User is not a conversation participant |
| `404`  | Conversation not found                 |
| `500`  | Unexpected server error                |

---

# 10. Pagination

Pagination is supported by:

```text
GET /api/v1/conversations

GET /api/v1/messages/:conversationId
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

The actual validation constraints are provided by the pagination validation schema used by the routes.

## Pagination Response

Paginated responses contain:

```text
page
limit
total
totalPages
```

Example:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

If a valid page contains no records, the API returns a successful response with an empty result array.

---

# 11. API Error Structure

Messaging APIs use Nexora's standard error response format.

Common status codes:

400 — Invalid request or validation failure
401 — Authentication required
403 — Authenticated user is not authorized
404 — Requested resource not found
500 — Unexpected server error

---

# 12. Response Data Exposure

Messaging APIs return only the user information required by the client.

Conversation participants expose:

```text
_id
name
profilePic
```

Message senders expose:

```text
_id
name
profilePic
```

Sensitive User information is not populated by these endpoints.

---

# 13. Conversation Creation Behavior

Creating a conversation for an existing user pair does not create a duplicate conversation.

If a conversation already exists, the existing conversation is returned.

---

# 14. Current API Scope

The implemented Messaging API currently supports:

- Conversation creation
- Conversation retrieval
- Conversation list retrieval
- Message creation
- Message retrieval
- Pagination

---

# 15. Unsupported Operations

The current API does not provide endpoints for:

* Editing messages.
* Deleting messages.
* Searching messages.
* Sending attachments.
* Message reactions.
* Typing indicators.
* Updating read status.
* Individual message retrieval by message ID.
* Real-time WebSocket messaging.
* Notification delivery.

These operations are outside the currently implemented API.

---

# 16. Related Documents

| Document                     | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `overview.md`                | Messaging module overview                    |
| `data-model.md`              | Conversation and Message database design     |
| `conversation-management.md` | Conversation-specific business rules         |
| `message-management.md`      | Message-specific behavior and implementation |

This document focuses on the HTTP API contracts and avoids duplicating the detailed design documented in the supporting files.

---

# 17. Implementation References

| File                                         | Responsibility                    |
| -------------------------------------------- | --------------------------------- |
| `src/routes/conversation.routes.js`          | Conversation API routes           |
| `src/routes/message.routes.js`               | Message API routes                |
| `src/controllers/conversation.controller.js` | Conversation HTTP handlers        |
| `src/controllers/message.controller.js`      | Message HTTP handlers             |
| `src/services/conversation.service.js`       | Conversation business logic       |
| `src/services/message.service.js`            | Message business logic            |
| `src/validations/conversation.validation.js` | Conversation parameter validation |
| `src/validations/message.validation.js`      | Message body validation           |
| `src/models/conversation.model.js`           | Conversation data model           |
| `src/models/message.model.js`                | Message data model                |

---

# 18. Revision History

| Version | Description                                                                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Initial Messaging API specification based on the implemented conversation and message routes, controllers, services, validation schemas, and models |
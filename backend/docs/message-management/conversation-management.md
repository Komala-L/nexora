# Conversation Management

## Document Information

| Property         | Value                   |
| ---------------- | ----------------------- |
| Project          | Nexora                  |
| Module           | Message Management      |
| Document Type    | Module Design           |
| Document Version | 0.1                     |
| Status           | Active                  |
| Review Status    | Approved                |
| Author           | Komala L                |
| Last Updated     | 14 September 2026       |

---

# 1. Overview

The Conversation Management module manages one-to-one conversations between connected Nexora users.

A conversation represents the communication channel between two users.

The module is responsible for:

* Creating conversations.
* Preventing duplicate conversations.
* Verifying the users have an accepted Connection.
* Retrieving conversations belonging to the authenticated user.
* Retrieving a specific conversation.
* Enforcing conversation-level authorization.
* Maintaining conversation activity information.

Message creation and message retrieval are handled by the Message Management module.

---

# 2. Objectives

The Conversation Management module is designed to:

* Provide a persistent conversation container for two users.
* Allow conversations only between accepted connections.
* Maintain one conversation per user pair.
* Reuse the existing Connection relationship identity.
* Prevent duplicate conversation records.
* Ensure only participants can access a conversation.
* Support paginated conversation lists.
* Provide sufficient participant information for the client.
* Maintain the timestamp of the latest message activity.
* Establish the conversation boundary used by Message Management.

---

# 3. Responsibilities

The module owns the following responsibilities:

| Responsibility          | Description                                        |
| ----------------------- | -------------------------------------------------- |
| Conversation creation   | Creates a conversation between connected users     |
| Connection verification | Confirms an accepted Connection exists             |
| Duplicate prevention    | Prevents multiple conversations for one user pair  |
| Participant management  | Stores the two conversation participants           |
| Conversation retrieval  | Returns conversations belonging to a user          |
| Authorization           | Ensures only participants can access conversations |
| Pagination              | Limits conversation list responses                 |
| Activity tracking       | Maintains `lastMessageAt`                          |
| Participant exposure    | Returns limited public participant information     |

---

# 4. Out of Scope

The Conversation Management module does not implement:

* User authentication.
* User profile management.
* Connection creation.
* Connection acceptance.
* Message creation.
* Message retrieval.
* Message editing.
* Message deletion.
* Read receipt management.
* Typing indicators.
* Online presence.
* Attachments.
* Message notifications.
* Message search.
* Conversation history or audit logs.

These responsibilities belong to other modules or future features.

---

# 5. Architecture

The module follows Nexora's layered backend architecture.

```text
Client
  ↓
Conversation Routes
  ↓
Authentication Middleware
  ↓
Validation Middleware
  ↓
Conversation Controller
  ↓
Conversation Service
  ↓
Conversation / Connection / User Models
  ↓
MongoDB
```

The route layer defines HTTP endpoints.

Authentication establishes the current user.

Validation verifies route and query parameters.

The controller handles HTTP request and response processing.

The service contains conversation business logic.

The models provide database access and schema constraints.

---

# 6. Component Structure

| Component               | Location                                     |
| ----------------------- | -------------------------------------------- |
| Conversation Routes     | `src/routes/conversation.routes.js`          |
| Conversation Controller | `src/controllers/conversation.controller.js` |
| Conversation Service    | `src/services/conversation.service.js`       |
| Conversation Model      | `src/models/conversation.model.js`           |
| Conversation Validation | `src/validations/conversation.validation.js` |
| Connection Model        | `src/models/connection.model.js`             |
| User Model              | `src/models/user.model.js`                   |

The Conversation module uses the existing Connection model to verify relationship eligibility.

---

# 7. Core Design

A Conversation represents a one-to-one communication channel.

The core structure is:

```text
Conversation
│
├── participants
├── pairKey
├── lastMessageAt
├── createdAt
└── updatedAt
```

The conversation does not contain message content.

Messages are stored separately in the `Message` collection and reference the conversation through the `conversation` field.

---

# 8. Conversation Identity

Each conversation is identified by a normalized `pairKey`.

The `pairKey` is inherited from the accepted Connection between the two users.

For example:

```text
User A = 123
User B = 456

pairKey = 123:456
```

The same relationship identity is used regardless of which user initiates conversation creation.

The `pairKey` is unique in the Conversation collection.

Therefore:

> A user pair can have at most one Conversation document.

---

# 9. Connection Dependency

Conversation creation depends on the Connection Management module.

Before creating a conversation, the service searches for an accepted Connection involving:

```text
authenticated user
        +
target user
        +
status = accepted
```

If no accepted Connection exists, conversation creation is rejected.

This prevents users from opening conversations with users they are not connected with.

---

# 10. Accepted Connection Requirement

The service checks both possible Connection directions.

```text
requester = A
recipient = B
```

or:

```text
requester = B
recipient = A
```

The Connection must have:

```text
status = accepted
```

The original requester and recipient direction does not matter once the connection is accepted.

---

# 11. Self-Conversation Prevention

A user cannot create a conversation with themselves.

For example:

```text
A → A
```

is invalid.

The service compares the authenticated user ID with the requested target user ID.

If they match, the service returns:

```text
400 Bad Request
```

No Conversation document is created.

---

# 12. Target User Validation

The requested target user must exist in the `User` collection.

The service verifies the target user before checking the accepted Connection.

If the user does not exist:

```text
404 Not Found
```

is returned.

No Conversation document is created.

---

# 13. Conversation Creation Strategy

Conversation creation follows this sequence:

```text
Authenticated User
        ↓
Validate Target User
        ↓
Prevent Self Conversation
        ↓
Verify Accepted Connection
        ↓
Find Existing Conversation
        ↓
Return Existing Conversation
        OR
Create Conversation
```

This keeps conversation creation centralized inside the Conversation service.

---

# 14. Existing Conversation Handling

Before creating a new Conversation document, the service searches using:

```text
pairKey = connection.pairKey
```

If a conversation already exists, it is returned directly.

A second Conversation document is not created.

This makes conversation creation effectively idempotent for an existing user pair.

---

# 15. Conversation Participants

The Conversation model contains:

```text
participants: [
    requester,
    recipient
]
```

The participants originate from the accepted Connection.

Both values reference the `User` collection.

The Conversation therefore stores the two users participating in the communication channel.

---

# 16. Participant Constraint

The Conversation schema contains a validation rule preventing the same user from appearing twice when exactly two participants are present.

Invalid example:

```text
participants = [
    A,
    A
]
```

This protects the basic one-to-one conversation invariant.

---

# 17. PairKey Constraint

The Conversation schema defines `pairKey` as:

```text
required: true
unique: true
immutable: true
```

These properties provide important database guarantees.

`required` ensures every conversation has an identity.

`unique` prevents duplicate active conversations.

`immutable` prevents the relationship identity from being changed after creation.

---

# 18. Conversation Timestamps

The Conversation schema uses Mongoose timestamps.

The model therefore contains:

```text
createdAt
updatedAt
```

`createdAt` records when the conversation was created.

`updatedAt` records when the conversation document was last modified.

These timestamps are maintained automatically by Mongoose.

---

# 19. Last Message Activity

The Conversation model contains:

```text
lastMessageAt
```

Its default value is:

```text
null
```

When a message is successfully created, Message Management updates:

```text
conversation.lastMessageAt
```

to the message creation time.

This field allows conversation lists to prioritize recently active conversations.

---

# 20. Conversation Ordering

The conversation list is sorted using:

```text
lastMessageAt: -1
updatedAt: -1
```

The primary ordering is therefore based on the latest message activity.

`updatedAt` provides secondary ordering when required.

This supports a familiar messaging-interface behavior where recently active conversations appear first.

---

# 21. Conversation Index

The Conversation model defines the following index:

```text
participants: 1
lastMessageAt: -1
```

This supports queries involving conversation participants and conversation activity ordering.

The unique `pairKey` constraint separately protects conversation identity.

---

# 22. Data Model Summary

| Field           | Type       | Required  | Mutable | Purpose                   |
| --------------- | ---------- | --------- | ------- | ------------------------- |
| `participants`  | ObjectId[] | Yes       | Yes     | Two users in conversation |
| `pairKey`       | String     | Yes       | No      | Unique user-pair identity |
| `lastMessageAt` | Date       | No        | Yes     | Latest message activity   |
| `createdAt`     | Date       | Automatic | No      | Creation timestamp        |
| `updatedAt`     | Date       | Automatic | Yes     | Modification timestamp    |

---

# 23. User References

Both participants reference the `User` model.

The Conversation document does not duplicate user profile information.

When conversations are returned, participants are populated from the User collection.

The populated fields are limited to:

```text
_id
name
profilePic
```

---

# 24. Data Exposure

Conversation APIs expose only the participant information required by the client.

The following user information is not populated by the Conversation service:

```text
email
password
refreshToken
location
discoveryLocation
```

This maintains the same privacy boundary used by the Connection Management module.

---

# 25. Conversation Retrieval

Authenticated users can retrieve their conversations through:

```http
GET /api/v1/conversations
```

The service filters conversations using:

```text
participants = authenticated user
```

Only conversations belonging to the current user are returned.

---

# 26. Conversation List Filtering

The conversation list uses the authenticated user's ID.

Conceptually:

```text
Conversation.find({
    participants: userId
})
```

This prevents unrelated conversations from appearing in the user's conversation list.

The client does not provide the user ID as a filter.

---

# 27. Conversation Pagination

Conversation lists support pagination.

The supported parameters are:

```text
page
limit
```

The service calculates:

```text
skip = (page - 1) × limit
```

The query then applies `skip` and `limit`.

---

# 28. Pagination Defaults

The service uses:

```text
page = 1
limit = 20
```

when pagination values are not supplied.

The route validates query parameters using the existing Connection pagination validation schema.

The documented maximum limit is:

```text
50
```

---

# 29. Pagination Response

Conversation list responses contain:

```text
conversations
pagination
```

Pagination metadata contains:

```text
page
limit
total
totalPages
```

This allows the frontend to determine the available result pages.

---

# 30. Empty Conversation List

If the authenticated user has no conversations, the API returns a successful response containing an empty conversation array.

Example:

```json
{
  "conversations": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

No error is generated for an empty list.

---

# 31. Specific Conversation Retrieval

A specific conversation can be retrieved using:

```http
GET /api/v1/conversations/:conversationId
```

The conversation ID is validated before reaching the controller.

The service then retrieves the conversation from MongoDB.

---

# 32. Conversation Authorization

Finding a conversation by ID is not sufficient for access.

After retrieval, the service verifies that the authenticated user exists in:

```text
conversation.participants
```

The conversation is returned only when the user is a participant.

---

# 33. Unauthorized Conversation Access

If a conversation exists but the authenticated user is not a participant:

```text
403 Forbidden
```

is returned.

The existence of the conversation does not grant access.

This prevents users from accessing conversations belonging to other users.

---

# 34. Missing Conversation

If the requested conversation ID does not match an existing Conversation document:

```text
404 Not Found
```

is returned.

The service uses the message:

```text
Conversation not found
```

---

# 35. Conversation Access Boundary

Conversation access is therefore determined by:

```text
Authenticated User
        ↓
Conversation
        ↓
Is user in participants?
        ↓
Yes → Allow
No  → 403
```

This check is performed in the service layer.

---

# 36. Message Management Boundary

Conversation Management owns the conversation container.

Message Management owns the messages inside that container.

The relationship is:

```text
Conversation
     │
     └── Message
```

A Message references its parent Conversation.

Conversation Management does not store message documents directly.

---

# 37. Message Activity Integration

When Message Management successfully creates a message, it updates:

```text
Conversation.lastMessageAt
```

The purpose of this field is to support conversation ordering.

The Conversation service does not create messages itself.

---

# 38. Conversation and Connection Relationship

The relationship between the modules is:

```text
User
 ↓
Connection
 ↓
Accepted Connection
 ↓
Conversation
 ↓
Message
```

The Connection establishes whether communication is permitted.

The Conversation provides the persistent communication channel.

The Message belongs to that channel.

---

# 39. Conversation Creation Dependency

Conversation creation uses the Connection's:

```text
pairKey
```

This avoids generating a separate relationship identity for the same pair of users.

The Connection and Conversation therefore share the same normalized user-pair identity.

---

# 40. Duplicate Prevention

Duplicate prevention exists at the service and database levels.

The service checks for an existing conversation using:

```text
pairKey
```

The database enforces:

```text
pairKey: unique
```

Together these provide predictable application behavior and database-level integrity.

---

# 41. Concurrency Consideration

Two requests could theoretically attempt to create a conversation for the same user pair at approximately the same time.

Both requests may pass the service-level existence check before either creates the document.

The unique `pairKey` constraint remains the database-level protection against duplicate Conversation documents.

The unique index is therefore the final integrity boundary.

---

# 42. Related Documents

| Document                | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `overview.md`           | Conversation Management module overview     |
| `data-model.md`         | Conversation and Message data model         |
| `api.md`                | Conversation and messaging API contracts    |
| `authorization.md`      | Conversation access and authorization rules |
| `message-management.md` | Message creation and retrieval behavior     |

The exact supporting document set may evolve as the messaging feature expands.

---

# 43. Implementation Reference

The current implementation is based on:

```text
src/models/conversation.model.js
src/controllers/conversation.controller.js
src/services/conversation.service.js
src/routes/conversation.routes.js
src/validations/conversation.validation.js
```

---

# 44. Revision History

| Version | Description                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Initial Conversation Management documentation based on the implemented Conversation model, routes, controllers, services, and validation |
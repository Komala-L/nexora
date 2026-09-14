# Message Management

## Document Information

| Property         | Value                     |
| ---------------- | ------------------------- |
| Project          | Nexora                    |
| Module           | Message Management        |
| Document Type    | Message Management Design |
| Document Version | 0.1                       |
| Status           | Active                    |
| Review Status    | Approved                  |
| Author           | Komala L                  |
| Last Updated     | 14 September 2026         |

---

# 1. Overview

The Message Management module is responsible for creating and retrieving messages within existing Nexora conversations.

The module allows authenticated users to:

* Send messages.
* Retrieve messages from a conversation.
* Maintain message ordering.
* Maintain conversation activity through `lastMessageAt`.
* Enforce conversation-level access control.
* Return limited sender information to clients.
* Support paginated message retrieval.

Message Management depends on the Conversation Management module to establish and authorize conversations.

The module does not create user relationships or determine whether two users are connected.

---

# 2. Responsibilities

The Message Management module is responsible for:

* Validating message content.
* Verifying conversation access.
* Creating message documents.
* Associating messages with conversations.
* Associating messages with authenticated senders.
* Updating conversation activity.
* Retrieving conversation messages.
* Ordering messages chronologically.
* Supporting pagination.
* Populating limited sender information.

The module is not responsible for:

* User authentication.
* Connection creation.
* Conversation creation.
* User discovery.
* Notifications.
* Real-time message delivery.

---

# 3. Component Structure

| Component          | Location                                |
| ------------------ | --------------------------------------- |
| Message Routes     | `src/routes/message.routes.js`          |
| Message Controller | `src/controllers/message.controller.js` |
| Message Service    | `src/services/message.service.js`       |
| Message Validation | `src/validations/message.validation.js` |
| Message Model      | `src/models/message.model.js`           |

---

# 4. Message Ownership

Every message belongs to:

* One conversation.
* One authenticated sender.

The relationship is represented by:

```text
Message
   │
   ├── conversation → Conversation
   │
   └── sender → User
```

The sender is derived from the authenticated request context.

The client does not provide the sender identity.

---

# 5. Message Creation

A message is created through the following flow:

```text
Authenticated User
        ↓
Validate conversationId
        ↓
Validate message content
        ↓
Verify conversation
        ↓
Verify user is participant
        ↓
Create Message
        ↓
Update lastMessageAt
        ↓
Return populated message
```

Message creation is performed by the Message service.

---

# 6. Sending Messages

The message creation operation accepts:

```text
conversationId
content
```

The sender is obtained from the authenticated user.

A message is created with:

```text
conversation
sender
content
```

The database automatically provides:

```text
createdAt
updatedAt
```

The created message is then populated with limited sender information before being returned.

---

# 7. Message Content Rules

Message content is validated before reaching the message service.

The implemented validation rules are:

| Rule           | Requirement     |
| -------------- | --------------- |
| Type           | String          |
| Required       | Yes             |
| Trim           | Yes             |
| Minimum length | 1 character     |
| Maximum length | 2000 characters |

Empty messages are rejected.

Messages exceeding 2000 characters are rejected.

The validation is strict, so unexpected fields are not accepted in the message request body.

---

# 8. Read Field

The Message model contains:

```text
read
```

The field is a Boolean with:

```text
default = false
```

New messages therefore begin with:

```text
read = false
```

The current implementation defines the field but does not expose a separate message-read operation.

Read-status management is therefore outside the currently implemented Message Management operations.

---

# 9. Message Ordering

Messages are retrieved in ascending creation order:

```text
createdAt: 1
```

Therefore, the response presents messages from oldest to newest.

Conceptually:

```text
Oldest message
      ↓
   Message 2
      ↓
   Message 3
      ↓
Newest message
```

This ordering is suitable for displaying a conversation chronologically.

---

# 10. Message Pagination

Message retrieval supports pagination.

The supported query parameters are:

```text
page
limit
```

The implementation uses:

```text
page = 1
limit = 20
```

when values are not supplied.

The pagination calculation is:

```text
skip = (page - 1) × limit
```

Pagination prevents the API from returning an unnecessarily large number of messages in one response.

---

# 11. Message Retrieval

The message retrieval flow is:

```text
Authenticated User
        ↓
Validate conversationId
        ↓
Verify conversation
        ↓
Verify participation
        ↓
Apply pagination
        ↓
Fetch messages
        ↓
Populate sender
        ↓
Sort by createdAt
        ↓
Return messages
```

Only messages belonging to the requested conversation are returned.

---

# 12. Conversation Message Filter

Message retrieval uses the conversation identifier as the primary filter:

```text
conversation = conversation._id
```

This ensures that messages from unrelated conversations are not included in the response.

The service obtains the conversation first and then queries messages belonging to that conversation.

---

# 13. Sender Population

Returned messages populate the sender with the limited fields required by the client.

The response does not populate sensitive User fields.

The Message API therefore avoids exposing unnecessary account information.

---

# 14. Conversation Activity

When a message is successfully created, the corresponding conversation is updated:

```text
conversation.lastMessageAt = message.createdAt
```

The conversation is then saved.

This allows Conversation Management to identify recently active conversations.

The Message module therefore updates conversation activity as part of successful message creation.

---

# 15. Atomicity Consideration

Sending a message consists of two related database operations:

```text
Create Message
      ↓
Update Conversation
```

The current implementation performs these operations sequentially.

The Message is created first.

After successful creation, the conversation's `lastMessageAt` is updated and saved.

Database transactions are not currently implemented for this operation.

---

# 16. Message Creation Result

The created message is populated with the required sender information before being returned.

The populated message is returned to the controller.

This allows the client to receive the message together with the sender information required for display.

---

# 17. Conversation Dependency

Message Management depends on an existing Conversation.

The conversation must exist before message creation.

The service verifies the conversation before creating the message.

---

# 18. Design Decisions

## Why reference the Conversation?

Messages belong to a specific conversation.

Using a reference allows multiple messages to be associated with one Conversation document.

## Why use the authenticated user as sender?

The sender must be trusted.

Using `req.user._id` prevents the client from impersonating another user.

## Why update `lastMessageAt`?

The conversation list needs an efficient way to identify recently active conversations.

## Why paginate messages?

A conversation may contain many messages.

Pagination prevents unnecessarily large responses.

## Why populate limited sender fields?

The client needs basic sender information for display, but does not require sensitive account data.

---

# 19. Current Message Lifecycle

The current implemented message lifecycle is intentionally simple:

```text
Conversation Participant
        ↓
Send Message
        ↓
Validate Content
        ↓
Create Message
        ↓
Update Conversation Activity
        ↓
Message Available for Retrieval
```

The module does not currently implement additional persisted message states.

---

# 20. Current Scope

The implemented Message Management scope is:

* Text message creation.
* Conversation-level authorization.
* Message retrieval.
* Chronological ordering.
* Pagination.
* Sender population.
* Conversation activity updates.
* Message read field definition.

These represent the functionality supported by the provided implementation.

---

# 21. Out of Scope

The current module does not cover:

* Message editing.
* Message deletion.
* Message search.
* Message reactions.
* File attachments.
* Image messages.
* Voice messages.
* Video messages.
* Typing indicators.
* Real-time WebSocket delivery.
* Push notifications.
* Email notifications.
* Complete read-receipt workflow.
* Message history/audit events.

These may be introduced as separate features in future iterations.

---

# 22. Related Modules

| Module                  | Relationship                               |
| ----------------------- | ------------------------------------------ |
| Authentication          | Provides authenticated user identity       |
| Connection Management   | Establishes accepted user relationships    |
| Conversation Management | Creates and manages conversations          |
| User Management         | Provides user information                  |
| Message Management      | Stores and retrieves conversation messages |

The modules maintain separate responsibilities.

---

# 23. Related Documents

| Document                     | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `overview.md`                | Messaging module overview                |
| `data-model.md`              | Conversation and message database design |
| `conversation-management.md` | Conversation-specific business rules     |
| `api.md`                     | Messaging API contracts                  |

This document focuses specifically on message-level behavior and avoids duplicating the complete API and conversation data-model specifications.

---

# 24. Implementation References

| File                                    | Responsibility                                |
| --------------------------------------- | --------------------------------------------- |
| `src/models/message.model.js`           | Message schema and indexes                    |
| `src/services/message.service.js`       | Message business logic                        |
| `src/controllers/message.controller.js` | HTTP request handling                         |
| `src/routes/message.routes.js`          | Message endpoints                             |
| `src/validations/message.validation.js` | Message content validation                    |

---

# 25. Revision History

| Version | Description                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Initial Message Management documentation based on the implemented message service, controller, routes, validation, and model |
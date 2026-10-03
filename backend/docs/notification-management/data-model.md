# Nexora Notification Data Model

> This document describes the MongoDB data model used by the Nexora Notification Management module, including the Notification schema, field responsibilities, relationships, constraints, indexes, read-state management, and integration with real-time messaging events.

---

## Document Information

| Property | Value |
|---|---|
| Project | Nexora |
| Module | Notification Management |
| Document Type | Data Model Design |
| Document Version | 0.2 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 3 October 2026 |

---

## 1. Overview

Notifications are stored as independent MongoDB documents in the `notifications` collection.

Each notification represents an event that should be communicated to a specific user.

A notification stores:

- The user who receives the notification.
- The user who triggered the notification.
- The notification type.
- Related connection, conversation, or message references.
- Whether the notification has been read.
- Creation and update timestamps.

The Notification model is implemented using Mongoose at:

```text
src/models/notification.model.js
```

The data model stores persistent notification state. Socket.IO synchronizes relevant notification state with connected frontend clients but does not replace MongoDB persistence.

---

## 2. Collection and Schema Structure

MongoDB collection: `notifications`

Mongoose model: `Notification`

The document structure is:

```text
Notification
├── recipient
├── sender
├── type
├── connection
├── conversation
├── message
├── read
├── createdAt
└── updatedAt
```

The Notification document does not store:

- Socket.IO connection IDs.
- Online/offline presence.
- Typing state.
- Message delivery state.
- Real-time subscription state.
- Frontend badge state.

These belong to the messaging and real-time application layers.

---

## 3. Complete Schema

```js
const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    type: {
      type: String,
      enum: [
        "connection_request",
        "connection_accepted",
        "connection_rejected",
        "message",
      ],
      required: true,
      immutable: true,
    },
    connection: {
      type: Schema.Types.ObjectId,
      ref: "Connection",
      default: null,
      immutable: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
      immutable: true,
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      immutable: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
```

---

## 4. Field Definitions

| Field | Type | Required | Default | Mutable | Purpose |
|---|---|---|---|---|---|
| recipient | ObjectId | Yes | — | No | User receiving the notification |
| sender | ObjectId | Yes | — | No | User triggering the event |
| type | String | Yes | — | No | Event that generated the notification |
| connection | ObjectId | No | null | No | Related Connection |
| conversation | ObjectId | No | null | No | Related Conversation |
| message | ObjectId | No | null | No | Related Message |
| read | Boolean | No | false | Yes | Notification read state |
| createdAt | Date | Auto | — | Managed | Creation time |
| updatedAt | Date | Auto | — | Managed | Last modification time |

---

## 5. Recipient and Sender

### 5.1 Recipient

The `recipient` field identifies the user who owns the notification.

```js
recipient: {
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true,
  immutable: true,
}
```

The field references the `User` collection and is immutable because notification ownership must not change after creation.

Notification access is performed in the context of the authenticated user.

### 5.2 Sender

The `sender` field identifies the user responsible for triggering the event.

```js
sender: {
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true,
  immutable: true,
}
```

When populated for frontend presentation, the relevant sender fields are:

- `_id`
- `name`
- `profilePic`

The sender remains immutable so that the original event context is preserved.

---

## 6. Notification Type

The `type` field is an immutable enum containing:

```text
connection_request
connection_accepted
connection_rejected
message
```

| Type | Trigger | Main Reference |
|---|---|---|
| `connection_request` | User sends connection request | connection |
| `connection_accepted` | Connection request is accepted | connection |
| `connection_rejected` | Connection request is rejected | connection |
| `message` | Connected user sends a message | conversation, message |

For reciprocal connection requests that automatically become accepted, the original requester receives a `connection_accepted` notification.

---

## 7. Related Entity References

### 7.1 Connection

```js
connection: {
  type: Schema.Types.ObjectId,
  ref: "Connection",
  default: null,
  immutable: true,
}
```

The `connection` field references the relevant Connection document.

It is used for:

- `connection_request`
- `connection_accepted`
- `connection_rejected`

For message notifications it is normally `null`.

### 7.2 Conversation

```js
conversation: {
  type: Schema.Types.ObjectId,
  ref: "Conversation",
  default: null,
  immutable: true,
}
```

The `conversation` field references the conversation associated with a message notification.

For connection notifications it is normally `null`.

### 7.3 Message

```js
message: {
  type: Schema.Types.ObjectId,
  ref: "Message",
  default: null,
  immutable: true,
}
```

The `message` field references the Message document that generated a message notification.

For connection notifications it is normally `null`.

These references allow the application to associate a notification with its relevant application context without embedding complete related documents.

---

## 8. Read State

```js
read: {
  type: Boolean,
  default: false,
}
```

New notifications are created with:

```js
read = false
```

After being read:

```js
read = true
```

The `read` field is intentionally mutable because it changes during the notification lifecycle.

**Read State Lifecycle**

```text
Notification Created
        |
        v
read = false
        |
        v
Unread
   |
   +----------------------+
   |                      |
   v                      v
Mark One as Read     Mark All as Read
   |                      |
   v                      v
read = true          read = true
```

---

## 9. Notification Relationships

The Notification model references the following entities:

| Notification Field | Referenced Model | Purpose |
|---|---|---|
| recipient | User | Notification owner |
| sender | User | Event initiator |
| connection | Connection | Connection event context |
| conversation | Conversation | Message conversation context |
| message | Message | Triggering message |

Relationship:

```text
              User
               |
       recipient / sender
               |
               v
        Notification
         /    |     \
        v     v      v
 Connection Conversation Message
```

The Notification model stores references rather than complete embedded documents.

---

## 10. Message Notification Relationship

For a message notification:

```text
User A sends message
        |
        v
     Message
        |
        +--> Conversation
        |
        v
  Notification
        |
        +--> sender
        +--> recipient
        +--> conversation
        +--> message
        +--> type = "message"
```

This creates a direct relationship between the notification and the messaging context that generated it.

Message Management remains responsible for message content, delivery state, and message read lifecycle. Notification Management stores the relevant message reference and notification read state.

---

## 11. Immutability and Data Integrity

The following fields are immutable:

- `recipient`
- `sender`
- `type`
- `connection`
- `conversation`
- `message`

The `read` field is mutable.

This preserves the original event context while allowing normal notification state changes.

Core integrity rules include:

- Every notification must have a recipient.
- Every notification must have a sender.
- Every notification must have a valid notification type.
- A notification belongs to exactly one recipient.
- New notifications are unread by default.
- Event-related references cannot be changed after creation.
- Connection references are used for connection events.
- Conversation and message references are used for message events.
- Notification access is performed in the authenticated user's context.

---

## 12. Self-Notification Prevention

The Notification Service prevents a user from receiving a notification generated by their own action.

The relevant rule is:

```text
recipient !== sender
```

If both users are the same, notification creation is rejected.

This validation is handled by the Notification Service rather than the frontend.

---

## 13. Timestamps and Version Key

The schema uses:

```js
{
  timestamps: true,
  versionKey: false,
}
```

Mongoose automatically maintains:

- `createdAt` — notification creation time.
- `updatedAt` — last notification document modification.

`createdAt` is used for newest-first notification retrieval.

The schema disables Mongoose's default version key, so notification documents do not contain the default `__v` field.

---

## 14. Database Indexes

The Notification model defines indexes around the primary notification access patterns.

### 14.1 Recipient and Creation Time

```js
notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});
```

This supports:

```text
recipient = authenticated user
sort by createdAt descending
```

It is used for retrieving a user's notification history with the newest notifications first.

### 14.2 Recipient, Read State, and Creation Time

```js
notificationSchema.index({
  recipient: 1,
  read: 1,
  createdAt: -1,
});
```

This supports queries involving:

- A specific recipient.
- Read/unread state.
- Creation-time ordering.
- Unread notification filtering.
- Unread notification counting.

---

## 15. Notification Retrieval Model

Notifications are retrieved for the authenticated user.

The primary access pattern is:

```text
Authenticated User
       |
       v
recipient = req.user._id
       |
       v
Notifications
       |
       v
createdAt DESC
```

Default pagination:

```text
page  = 1
limit = 20
```

The database indexes support the recipient-based and newest-first access pattern.

---

## 16. Unread Count Model

The unread notification count is calculated from notifications matching:

```text
recipient = authenticated user
AND
read = false
```

Conceptually:

```text
Authenticated User
        |
        v
Notifications
   /            \
read=false     read=true
   |              |
   v              v
 Count          Excluded
```

The resulting count is used by the frontend notification badge.

---

## 17. Read Operations

### 17.1 Mark One as Read

A selected notification transitions from:

```text
read: false
     |
     v
read: true
```

The operation applies only to a notification belonging to the authenticated recipient.

### 17.2 Mark All as Read

All unread notifications belonging to the authenticated user transition to:

```js
read: true
```

Example:

```text
Before:
Notification 1 -> false
Notification 2 -> false
Notification 3 -> false

After:
Notification 1 -> true
Notification 2 -> true
Notification 3 -> true
```

The resulting unread count is `0`.

---

## 18. Chat-Read Synchronization

Message notifications are integrated with the message read flow.

When the user reads the relevant conversation, the application can synchronize the corresponding notification state:

```text
User reads conversation
        |
        v
Message read state updated
        |
        v
Related notification state synchronized
        |
        v
Unread notification count updated
        |
        v
Notification badge synchronized
```

The Notification document continues to use the existing `read` boolean.

The synchronization occurs through application services and the real-time messaging layer rather than through additional fields in the Notification document.

---

## 19. Real-Time State Separation

Socket.IO provides real-time synchronization but does not add temporary connection state to the Notification document.

The following are not Notification fields:

- Socket connection ID.
- Online/offline presence.
- Typing state.
- Message delivery state.
- Real-time subscription state.
- Frontend badge state.

The persistent Notification model contains:

- `recipient`
- `sender`
- `type`
- `connection`
- `conversation`
- `message`
- `read`
- `createdAt`
- `updatedAt`

MongoDB remains the persistent source of notification data.

---

## 20. Real-Time Notification Synchronization

The persistent Notification model works together with the Socket.IO messaging layer.

General flow:

```text
Business Event
      |
      v
Notification Created / Updated
      |
      v
Real-Time Synchronization
      |
      v
Connected Client
      |
      v
Notification UI Updated
```

Real-time synchronization can keep connected frontend clients synchronized with:

- Notification-related UI state.
- Unread notification count.
- Individual notification read state.
- State associated with chat activity.

Socket.IO synchronizes connected clients; MongoDB remains responsible for persistent notification history.

---

## 21. Message Notification Real-Time Flow

A message-generated notification follows this conceptual flow:

```text
User A
  |
  | sends message
  v
Message Service
  |
  +--> Create Message
  |
  +--> Update Conversation
  |
  +--> Create Notification
  |
  +--> Real-Time Synchronization
  |
  v
User B
  |
  +--> Conversation update
  +--> Latest message update
  +--> Unread state update
  +--> Notification badge update
```

The Notification document stores persistent notification state while the real-time layer keeps the connected frontend synchronized.

---

## 22. Storage Strategy

Notifications are stored as independent MongoDB documents and reference related entities.

```text
User
 |
 +----------------------+
 |                      |
 v                      v
Connection          Notification
                        |
              +---------+---------+
              |                   |
              v                   v
        Conversation           Message
```

References rather than embedded documents provide:

- Smaller notification documents.
- Reduced data duplication.
- Independent entity management.
- Direct access to related application context.
- Easier maintenance of notification history.

---

## 23. Current Data Model Scope

The current Notification data model supports:

- Connection request notifications.
- Connection acceptance notifications.
- Connection rejection notifications.
- Message notifications.
- Persistent notification history.
- Read/unread state.
- Individual notification read updates.
- Mark-all-as-read behavior.
- Unread notification counting.
- Sender references.
- Recipient references.
- Connection references.
- Conversation references.
- Message references.
- Pagination-oriented retrieval.
- Recipient-based database indexing.
- Unread-query database indexing.
- Real-time notification state synchronization.
- Chat-read synchronization for message notifications.

The Notification schema remains intentionally focused on persistent notification data.

---

## 24. Future Considerations

Potential future data-model additions include:

- Notification grouping.
- Notification categories.
- Notification priority.
- Soft deletion.
- Notification preferences.
- Per-type notification settings.
- Additional notification event types.
- Browser push notification metadata.
- Mobile push notification metadata.
- Persistent real-time delivery metadata.

These capabilities are not part of the current Notification schema.

Real-time Socket.IO synchronization is already implemented, but persistent real-time delivery metadata is not currently stored inside the Notification document.

---

## 25. References

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Indexes](https://www.mongodb.com/docs/manual/indexes/)
- [Mongoose Schemas](https://mongoosejs.com/docs/guide.html)

---

## 26. Revision History

| Version | Description |
|---|---|
| 0.1 | Initial Notification Data Model documentation covering the Notification schema, fields, relationships, indexes, data integrity rules, and storage strategy |
| 0.2 | Updated Notification Data Model to document real-time synchronization, message notification integration, individual read-state synchronization, mark-all-as-read behavior, chat-read synchronization, and separation between persistent notification state and real-time messaging state |
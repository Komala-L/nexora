# Nexora Notification Data Model

> This document describes the MongoDB data model used by the Nexora Notification Management module, including the Notification schema, field responsibilities, relationships, constraints, and indexes.

---

## Document Information

| Property | Value |
|---|---|
| Project | Nexora |
| Module | Notification Management |
| Document Type | Data Model Design |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 17 September 2026 |

---

## 1. Overview

Notifications are stored as independent MongoDB documents in the `notifications` collection.

Each notification represents an event that should be communicated to a specific user.

A notification stores:

- The user who receives the notification.
- The user who triggered the notification.
- The type of notification.
- The related connection, when applicable.
- The related conversation, when applicable.
- The related message, when applicable.
- Whether the notification has been read.
- Creation and update timestamps.

The Notification model is implemented using Mongoose.

Implementation:

```text
src/models/notification.model.js
```

---

## 2. Collection

MongoDB collection: `notifications`

Mongoose model: `Notification`

The model is created using:

```js
mongoose.model("Notification", notificationSchema)
```

---

## 3. Schema Structure

The Notification document follows this structure:

```text
Notification
│
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

---

## 4. Field Definitions

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| recipient | ObjectId | Yes | — | User who receives the notification |
| sender | ObjectId | Yes | — | User who triggered the notification |
| type | String | Yes | — | Type of event that generated the notification |
| connection | ObjectId | No | null | Related connection document |
| conversation | ObjectId | No | null | Related conversation document |
| message | ObjectId | No | null | Related message document |
| read | Boolean | No | false | Indicates whether the notification has been read |
| createdAt | Date | Automatically generated | — | Notification creation time |
| updatedAt | Date | Automatically generated | — | Notification update time |

---

## 5. Recipient

```js
recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    immutable: true,
}
```

The `recipient` identifies the user who should receive the notification.

It references the `User` collection.

Example:

```text
recipient → Nayana
```

The field is immutable because the ownership of a notification should not change after creation.

---

## 6. Sender

```js
sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    immutable: true,
}
```

The `sender` identifies the user responsible for triggering the event.

Example:

```text
sender → Umesh
recipient → Nayana
```

The field is immutable because the user responsible for the event should remain associated with the notification.

---

## 7. Notification Type

```js
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
}
```

The `type` field determines which event generated the notification.

Supported values:

**`connection_request`**

Generated when a user sends a connection request.

```text
User A → User B
        connection request
              ↓
       User B receives
    connection_request
```

**`connection_accepted`**

Generated when a connection request is accepted.

```text
User B accepts request
          ↓
User A receives
connection_accepted
```

**`connection_rejected`**

Represents a notification associated with a rejected connection request.

**`message`**

Generated when a connected user sends a message.

```text
User A sends message
        ↓
User B receives
       message
```

The notification type is immutable after creation.

---

## 8. Connection Reference

```js
connection: {
    type: Schema.Types.ObjectId,
    ref: "Connection",
    default: null,
    immutable: true,
}
```

The `connection` field stores a reference to the relevant Connection document.

It is primarily used for:

- `connection_request`
- `connection_accepted`
- `connection_rejected`

For message notifications, this field is normally `null`.

---

## 9. Conversation Reference

```js
conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    default: null,
    immutable: true,
}
```

The `conversation` field references the Conversation associated with a message notification.

For example:

```text
User A sends message
        ↓
Conversation
        ↓
Message notification
        ↓
conversation → Conversation._id
```

This reference allows the application to identify the conversation associated with the notification.

---

## 10. Message Reference

```js
message: {
    type: Schema.Types.ObjectId,
    ref: "Message",
    default: null,
    immutable: true,
}
```

The `message` field references the Message that generated a message notification.

For example:

```text
Message
  |
  └── message._id
          ↓
Notification.message
```

This provides a direct relationship between the notification and the triggering message.

---

## 11. Read State

```js
read: {
    type: Boolean,
    default: false,
}
```

The `read` field tracks whether the recipient has viewed or acknowledged the notification.

New notifications are created as:

```js
read = false
```

After the user marks the notification as read:

```js
read = true
```

Unlike the identity and event fields, this field is intentionally mutable.

---

## 12. Timestamps

The schema uses:

```js
{
    timestamps: true
}
```

Mongoose automatically creates:

- `createdAt`
- `updatedAt`

**`createdAt`**

Records when the notification was created.

It is used to display notifications from newest to oldest.

**`updatedAt`**

Records when the notification document was last modified.

The field is maintained automatically by Mongoose through the `timestamps` option.

---

## 13. Immutability

The following fields are immutable:

- `recipient`
- `sender`
- `type`
- `connection`
- `conversation`
- `message`

This ensures that once a notification is created, its original event context cannot be reassigned.

The `read` field remains mutable because its value changes during the notification lifecycle.

---

## 14. Relationships

The Notification model has relationships with several Nexora entities.

```text
                ┌─────────────┐
                │    User     │
                └──────┬──────┘
                       │
                recipient / sender
                       │
                       v
                ┌─────────────┐
                │Notification │
                └──────┬──────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          v                         v
    Connection Event          Message Event
          │                         │
          v                         v
    Connection            Conversation + Message
```

### Relationship Summary

| Notification Field | Referenced Model | Purpose |
|---|---|---|
| recipient | User | Notification recipient |
| sender | User | User who triggered the event |
| connection | Connection | Related connection event |
| conversation | Conversation | Related conversation |
| message | Message | Related message |

---

## 15. Notification Examples

**Connection Request**

```js
{
    recipient: userB,
    sender: userA,
    type: "connection_request",
    connection: connectionId,
    conversation: null,
    message: null,
    read: false
}
```

**Connection Accepted**

```js
{
    recipient: userA,
    sender: userB,
    type: "connection_accepted",
    connection: connectionId,
    conversation: null,
    message: null,
    read: false
}
```
**Connection Rejected**

```js
{
    recipient: userA,
    sender: userB,
    type: "connection_rejected",
    connection: connectionId,
    conversation: null,
    message: null,
    read: false
}
```

**Message Notification**

```js
{
    recipient: userB,
    sender: userA,
    type: "message",
    connection: null,
    conversation: conversationId,
    message: messageId,
    read: false
}
```

---

## 16. Database Indexes

The Notification model defines two indexes.

**Recipient and Creation Time**

```js
notificationSchema.index({
    recipient: 1,
    createdAt: -1,
});
```

This index supports retrieving a user's notifications ordered by newest first.

Primary query pattern:

```text
recipient = userId
sort by createdAt descending
```

**Recipient, Read State, and Creation Time**

```js
notificationSchema.index({
    recipient: 1,
    read: 1,
    createdAt: -1,
});
```

This index supports queries involving:

- A specific recipient.
- Read/unread state.
- Creation time ordering.

It is useful for operations such as unread notification queries.

---

## 17. Version Key

The schema disables Mongoose's default version key:

```js
{
    versionKey: false
}
```

Therefore, notification documents do not contain the default `__v` field.

---

## 18. Data Integrity Rules

The Notification model follows these rules:

- Every notification must have a recipient.
- Every notification must have a sender.
- Every notification must have a valid notification type.
- The Notification Service prevents the sender and recipient from being the same user.
- Event-related references cannot be changed after creation.
- New notifications are unread by default.
- A notification belongs to exactly one recipient.
- Related entity references are stored only when relevant to the notification type.

---

## 19. Current Data Model Scope

The current model supports:

- Connection request notifications.
- Connection acceptance notifications.
- Connection rejection notifications.
- Message notifications.
- Read/unread state.
- Notification history.
- References to related application entities.
- Efficient recipient-based queries.
- Efficient unread notification queries.

The model is designed so that additional notification types can be added to the enum as Nexora's feature set expands.

---

## 20. Future Considerations

Potential future changes may include:

- Notification grouping.
- Notification categories.
- Notification priority.
- Soft deletion.
- Notification preferences.
- Additional event types.
- Real-time delivery metadata.

These are not part of the current implementation.

---

## 21. Revision History

| Version | Description |
|---------|-------------|
| 0.1 | Initial Notification Data Model documentation covering the Notification schema, fields, relationships, indexes, data integrity rules, and storage strategy |
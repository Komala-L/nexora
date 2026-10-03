# Messaging Data Model

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Message Management |
| Document Type | Data Model Design |
| Document Version | 0.2 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 2 October 2026 |

---

## 1. Overview

The Nexora messaging data model represents private communication between two connected users.

The messaging relationship is:

```text
User
 │
 │ participants
 ▼
Conversation
 │
 │ conversation
 ▼
Message
 │
 ├── sender
 │
 ├── content
 │
 ├── attachments
 │
 ├── delivery state
 │
 ├── read state
 │
 └── deletion state
```

A conversation contains two users.

A conversation can contain multiple messages.

Each message belongs to exactly one conversation.

Each message is sent by exactly one user.

Messages can contain text content, image attachments, document attachments, or a combination of message metadata and attachments depending on the message type.

The messaging system also maintains message lifecycle information through:

- `sentAt`
- `deliveredAt`
- `readAt`
- `deletedFor`

These fields support the upgraded real-time messaging experience.

---

## 2. Model Files

The messaging models are located at:

```text
backend/src/models/
├── conversation.model.js
└── message.model.js
```

**Conversation Model**

```text
backend/src/models/conversation.model.js
```

Mongoose model: `Conversation`

MongoDB collection: `conversations`

**Message Model**

```text
backend/src/models/message.model.js
```

Mongoose model: `Message`

MongoDB collection: `messages`

---

## 3. Conversation Model

The Conversation model represents a private conversation between two connected users.

### 3.1 Schema

```js
const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    pairKey: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
```

### 3.2 Fields

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| participants | ObjectId[] | Yes | — | Users in the conversation |
| pairKey | String | Yes | — | Unique connected-user pair |
| lastMessageAt | Date | No | null | Latest message activity |
| createdAt | Date | Auto | — | Creation timestamp |
| updatedAt | Date | Auto | — | Update timestamp |

### 3.3 Participants Rules

A conversation contains two different User references. The current implementation prevents the same user from appearing twice, preventing self-conversations.

### 3.4 Participant Validation

A conversation cannot contain the same user twice.

The model validates that:

```js
participants[0] !== participants[1]
```

The actual validation compares the MongoDB ObjectIds after converting them to strings.

If both participant IDs are identical, the model throws:

```text
Conversation participants must be different users
```

This prevents a user from creating a conversation with themselves.

### 3.5 Pair Key

`pairKey` uniquely identifies the connected user pair.

It is required, unique, and immutable. The value corresponds to the accepted Connection's `pairKey`, ensuring that one connected pair maps to one conversation.

### 3.6 Last Message Timestamp

`lastMessageAt` stores the timestamp of the latest message activity and is used to order conversations by recent activity.

### 3.7 Schema Options

The Conversation schema uses `timestamps: true`, creating `createdAt` and `updatedAt`.

`versionKey: false` disables Mongoose's default `__v` field.

### 3.8 Conversation Index

The Conversation model defines the following index:

```js
conversationSchema.index({
  participants: 1,
  lastMessageAt: -1,
});
```

The index supports queries that:

- Find conversations belonging to a user.
- Order conversations by recent activity.

---

## 4. Message Model

The Message model represents an individual communication event inside a conversation.

A message can represent:

- Text communication.
- Image communication.
- Document communication.

The model also stores:

- Sender information.
- Conversation ownership.
- Attachments.
- Sent timestamp.
- Delivery timestamp.
- Read timestamp.
- Per-user deletion state.
- Automatic creation and update timestamps.

### 4.1 Schema

```js
const attachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
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
      enum: ["text", "image", "document"],
      default: "text",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    sentAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },

    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
```

### 4.2 Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| conversation | ObjectId | Yes | — | Conversation containing the message |
| sender | ObjectId | Yes | — | Authenticated user who sent the message |
| type | String | Yes | `text` | `text`, `image`, or `document` |
| content | String | No | `""` | Optional text content, maximum 2000 characters |
| attachments | Attachment[] | No | `[]` | Embedded attachment metadata |
| sentAt | Date | No | `Date.now` | Message send timestamp |
| deliveredAt | Date | No | `null` | Delivery acknowledgement timestamp |
| readAt | Date | No | `null` | Read acknowledgement timestamp |
| deletedFor | ObjectId[] | No | `[]` | Users for whom the message is hidden |
| createdAt | Date | Auto | — | Mongoose creation timestamp |
| updatedAt | Date | Auto | — | Mongoose update timestamp |

`conversation` and `sender` are immutable after creation.

`type` is restricted to `text`, `image`, and `document`.

`content` is trimmed and limited to 2000 characters. Text messages require content at the service layer, while attachment messages may have empty content.

`sentAt` is immutable. `deliveredAt` and `readAt` begin as `null` and are updated when the corresponding lifecycle state is recorded.

`deletedFor` provides per-user message visibility without removing the underlying Message document.

The Message schema uses `timestamps: true` and `versionKey: false`.

---

## 5. Relationships

### 5.1 User and Conversation

A user can participate in multiple conversations. The relationship is stored through `Conversation.participants`.

### 5.2 Conversation and Message

A conversation contains multiple messages. Each message references its conversation through `Message.conversation`.

### 5.3 User and Message

A user can send multiple messages. Each message references its sender through `Message.sender`.

### 5.4 Connection and Conversation

A conversation is created for an accepted connection. The connection's `pairKey` is reused as `Conversation.pairKey` to maintain one conversation per connected user pair.

### 5.5 Message and Attachments

A message can contain zero or more embedded attachment subdocuments through `Message.attachments`.

### 5.6 Message and Delivery/Read State

Message lifecycle state is stored directly through `sentAt`, `deliveredAt`, `readAt`, and `deletedFor`.

---

## 6. Indexes

The Messaging models define indexes for frequently used queries.

### 6.1 Conversation Index

```js
conversationSchema.index({
  participants: 1,
  lastMessageAt: -1,
});
```

Supports retrieving a user's conversations by recent activity.

### 6.2 Message Index

```js
messageSchema.index({
  conversation: 1,
  createdAt: 1,
});
```

Supports chronological retrieval of messages belonging to a conversation.

---

## 7. Data Integrity

### Conversation Rules

The Conversation model enforces:

- Participants are required.
- Participant references use the User model.
- The same user cannot appear twice.
- `pairKey` is required.
- `pairKey` is unique.
- `pairKey` is immutable.
- `lastMessageAt` defaults to `null`.
- `createdAt` and `updatedAt` are automatically maintained.
- The Mongoose version key is disabled.

### Message Rules

The Message model enforces:

- Conversation reference is required.
- Conversation reference is immutable.
- Sender reference is required.
- Sender reference is immutable.
- Message type is required.
- Message type must be one of `text`, `image`, or `document`.
- Message content defaults to an empty string.
- Message content is trimmed.
- Message content cannot exceed 2000 characters.
- Attachments default to an empty array.
- Attachment URLs are required when an attachment exists.
- Attachment public IDs are required when an attachment exists.
- Attachment file names are required and trimmed.
- Attachment MIME types are required and trimmed.
- Attachment size is required and cannot be negative.
- Attachment subdocuments do not receive their own `_id`.
- `sentAt` is automatically initialized and immutable.
- `deliveredAt` defaults to `null`.
- `readAt` defaults to `null`.
- `deletedFor` stores User references.
- `createdAt` and `updatedAt` are automatically maintained.
- The Mongoose version key is disabled.

---

## 8. Message Lifecycle

Message state is represented by timestamp fields:

```text
Created → Sent → Delivered → Read
```

- sentAt - records the send time.
- deliveredAt - records delivery acknowledgement.
- readAt - records read acknowledgement.
- deletedFor - records per-user visibility deletion.

These fields allow the Message document to retain its lifecycle state without separate collections.

---

## 9. Storage Strategy

Conversation metadata and messages are stored in separate MongoDB collections.

```text
conversations
      │
      │ referenced by
      ▼
messages
```

Messages are not embedded inside Conversation documents. This supports independent message pagination, indexing, and scalable message history.

Attachments are embedded inside Message documents because their metadata belongs directly to the message.

---

## 10. Design Decisions

**Why separate Conversation and Message?**

A conversation represents the communication channel, while messages represent individual communication events.

Separating these entities allows:

- Conversation metadata to remain lightweight.
- Messages to be independently paginated.
- Message history to scale independently.
- Conversation activity to be tracked through `lastMessageAt`.

**Why use `pairKey`?**

The connection provides a normalized identifier for the connected user pair.

Using the same `pairKey` for the conversation ensures that the same connected pair maps to one conversation.

```text
Connection.pairKey
        │
        ▼
Conversation.pairKey
```

**Why use `sentAt`, `deliveredAt`, and `readAt`?**

A single boolean cannot represent the complete lifecycle of a message.

Timestamp fields allow the application to distinguish:

```text
Sent
  ↓
Delivered
  ↓
Read
```

They also provide the actual time at which each state was recorded.

**Why use attachments as embedded subdocuments?**

Attachment metadata belongs directly to the message that contains it.

Embedding attachment information inside the Message document keeps:

```text
Message
   │
   └── attachments[]
```

as a single logical message record.

**Why use `deletedFor`?**

Messages may need to be hidden for one user without removing the underlying message document.

The `deletedFor` array allows deletion state to be associated with individual users.

---

## 11. References

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [HTTP Semantics / RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [OWASP API Security Guidance](https://owasp.org/www-project-api-security/)

---

## 12. Revision History

| Version | Description |
|---------|-------------|
| 0.1 | Initial Conversation and Message data model |
| 0.2 | Updated Notification Management documentation to reflect real-time Socket.IO synchronization, notification-count synchronization, notification read-state synchronization, chat-related synchronization, frontend notification integration, and the separation between MongoDB persistence and real-time client state |
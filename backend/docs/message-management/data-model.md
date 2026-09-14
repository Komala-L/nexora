# Messaging Data Model

## Document Information

| Property         | Value                   |
| ---------------- | ----------------------- |
| Project          | Nexora                  |
| Module           | Message Management      |
| Document Type    | Data Model Design       |
| Document Version | 0.1                     |
| Status           | Active                  |
| Review Status    | Approved                |
| Author           | Komala L                |
| Last Updated     | 14 September 2026       |

## 1. Overview

The messaging data relationship is:

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
 │ sender
 ▼
User
```

A conversation contains two users.

A conversation can contain multiple messages.

Each message belongs to exactly one conversation.

Each message is sent by exactly one user.

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

| Field | Type | Required | Default |
|-------|------|----------|---------|
| participants | ObjectId[] | Yes | — |
| pairKey | String | Yes | — |
| lastMessageAt | Date | No | null |
| createdAt | Date | Auto | — |
| updatedAt | Date | Auto | — |

### 3.3 Participants

The `participants` field stores references to the users participating in the conversation.

```js
participants: [
  {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
]
```

The current implementation creates conversations between two users.

The users are referenced through their MongoDB ObjectIds.

### 3.4 Participant Validation

A conversation cannot contain the same user twice.

The model validates that:

```js
participants[0] !== participants[1]
```

If both participant IDs are identical, the model throws:

```text
Conversation participants must be different users
```

### 3.5 Pair Key

The `pairKey` identifies the unique connected-user pair.

```js
pairKey: {
  type: String,
  required: true,
  unique: true,
  immutable: true,
}
```

Properties:

- Required
- Unique
- Immutable

The value comes from the corresponding accepted Connection.

Relationship:

```text
Connection.pairKey
        │
        ▼
Conversation.pairKey
```

This prevents multiple conversations from being created for the same connection.

### 3.6 Last Message Timestamp

The `lastMessageAt` field stores the timestamp of the latest message.

```js
lastMessageAt: {
  type: Date,
  default: null,
}
```

When a message is created:

```text
Message.createdAt
       │
       ▼
Conversation.lastMessageAt
```

### 3.7 Timestamps

The Conversation schema uses:

```js
timestamps: true
```

Mongoose automatically creates:

- `createdAt`
- `updatedAt`

These fields are maintained by Mongoose.

### 3.8 Version Key

The Conversation schema uses:

```js
versionKey: false
```

Therefore, Mongoose does not add the default `__v` field.

---

## 4. Message Model

The Message model represents an individual text message inside a conversation.

### 4.1 Schema

```js
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

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
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

### 4.2 Fields

| Field | Type | Required | Default |
|-------|------|----------|---------|
| conversation | ObjectId | Yes | — |
| sender | ObjectId | Yes | — |
| content | String | Yes | — |
| read | Boolean | No | false |
| createdAt | Date | Auto | — |
| updatedAt | Date | Auto | — |

### 4.3 Conversation Reference

The `conversation` field identifies the conversation containing the message.

```js
conversation: {
  type: Schema.Types.ObjectId,
  ref: "Conversation",
  required: true,
  immutable: true,
}
```

Relationship:

```text
Conversation._id
       │
       ▼
Message.conversation
```

The field is immutable because a message should remain associated with its original conversation.

### 4.4 Sender Reference

The `sender` field identifies the user who sent the message.

```js
sender: {
  type: Schema.Types.ObjectId,
  ref: "User",
  required: true,
  immutable: true,
}
```

### 4.5 Message Content

The `content` field stores the message text.

```js
content: {
  type: String,
  required: true,
  trim: true,
  maxlength: 2000,
}
```

Rules:

- Content is required.
- Leading and trailing whitespace is removed.
- Maximum length is 2000 characters.

### 4.6 Read State

The `read` field represents whether a message has been read.

```js
read: {
  type: Boolean,
  default: false,
}
```

New messages are created with:

```js
read = false
```

### 4.7 Timestamps

The Message schema uses:

```js
timestamps: true
```

Mongoose automatically creates:

- `createdAt`
- `updatedAt`

### 4.8 Version Key

The Message schema uses:

```js
versionKey: false
```

Therefore, Mongoose does not add `__v` to Message documents.

---

## 5. Relationships

### 5.1 User and Conversation

A user can participate in multiple conversations.

```text
User
 │
 ├── Conversation A
 ├── Conversation B
 └── Conversation C
```

The relationship is stored through `Conversation.participants`.

### 5.2 Conversation and Message

A conversation can contain multiple messages.

```text
Conversation
 │
 ├── Message 1
 ├── Message 2
 ├── Message 3
 └── Message N
```

The relationship is stored through `Message.conversation`.

Relationship type:

```text
One Conversation → Many Messages
```

### 5.3 User and Message

A user can send multiple messages.

```text
User
 │
 ├── Message 1
 ├── Message 2
 └── Message N
```

The relationship is stored through `Message.sender`.

### 5.4 Connection and Conversation

A conversation is created only for an accepted connection.

The Connection model provides the `pairKey`.

```text
Connection
    │
    │ pairKey
    ▼
Conversation
```

---

## 6. Entity Relationship

```text
┌──────────────┐
│     User     │
│              │
│ _id          │
└──────┬───────┘
       │
       │ participants
       ▼
┌─────────────────────┐
│    Conversation     │
│                     │
│ _id                 │
│ participants[]      │
│ pairKey             │
│ lastMessageAt       │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │
           │ conversation
           ▼
┌─────────────────────┐
│       Message       │
│                     │
│ _id                 │
│ conversation        │
│ sender              │
│ content             │
│ read                │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │
           │ sender
           ▼
      ┌──────────┐
      │   User   │
      └──────────┘
```

---

## 7. Indexes

The Messaging models define indexes for frequently used queries.

### 7.1 Conversation Index

```js
conversationSchema.index({
  participants: 1,
  lastMessageAt: -1,
});
```

Purpose:

- Find conversations belonging to a user.
- Support ordering by recent conversation activity.

Primary query:

```text
participants contains userId
ORDER BY lastMessageAt DESC
```

### 7.2 Message Index

```js
messageSchema.index({
  conversation: 1,
  createdAt: 1,
});
```

Purpose:

- Find messages belonging to a conversation.
- Support chronological message retrieval.

Primary query:

```text
conversation = conversationId
ORDER BY createdAt ASC
```

---

## 8. Data Integrity

### Conversation Rules

The Conversation model enforces:

- Participants are required.
- Participant references use the User model.
- The same user cannot appear twice.
- `pairKey` is required.
- `pairKey` is unique.
- `pairKey` is immutable.
- `lastMessageAt` defaults to `null`.

### Message Rules

The Message model enforces:

- Conversation reference is required.
- Conversation reference is immutable.
- Sender reference is required.
- Sender reference is immutable.
- Message content is required.
- Message content is trimmed.
- Message content cannot exceed 2000 characters.
- `read` defaults to `false`.

---

## 9. Example Conversation Document

```json
{
  "_id": "CONVERSATION_ID",
  "participants": [
    "USER_ID_A",
    "USER_ID_B"
  ],
  "pairKey": "PAIR_KEY",
  "lastMessageAt": "2026-09-14T08:30:00.000Z",
  "createdAt": "2026-09-14T08:20:00.000Z",
  "updatedAt": "2026-09-14T08:30:00.000Z"
}
```

The IDs and timestamps are examples only.

---

## 10. Example Message Document

```json
{
  "_id": "MESSAGE_ID",
  "conversation": "CONVERSATION_ID",
  "sender": "USER_ID_A",
  "content": "Hello, how are you?",
  "read": false,
  "createdAt": "2026-09-14T08:30:00.000Z",
  "updatedAt": "2026-09-14T08:30:00.000Z"
}
```

The IDs and timestamps are examples only.

---

## 11. Storage Strategy

Conversation metadata and message data are stored separately.

```text
conversations
      │
      │ referenced by
      ▼
messages
```

Messages are not embedded inside the Conversation document.

This allows:

- Independent message retrieval.
- Message pagination.
- Efficient message indexing.
- Smaller Conversation documents.
- Separate management of message history.

The Conversation document stores conversation-level information.

The Message document stores individual message information.

---

## 12. Revision History

| Version | Description                                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Initial Messaging Data Model documentation covering Conversation and Message schemas, relationships, indexes, data integrity, and storage strategy |
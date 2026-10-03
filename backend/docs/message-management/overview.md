# Nexora Messaging Management Overview

> This document describes the architecture, responsibilities, business rules, and implementation principles of the Nexora Messaging module.

> It explains how Nexora creates conversations between connected users and manages messages within those conversations, including real-time communication, presence, typing indicators, delivery/read receipts, attachments, and conversation activity updates.

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Message Management |
| Document Type | Module Overview |
| Document Version | 0.2 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 02 October 2026 |

---

## Implementation Location

| Component | Location |
|----------|----------|
| Conversation Model | `src/models/conversation.model.js` |
| Message Model | `src/models/message.model.js` |
| Conversation Routes | `src/routes/conversation.routes.js` |
| Message Routes | `src/routes/message.routes.js` |
| Conversation Controller | `src/controllers/conversation.controller.js` |
| Message Controller | `src/controllers/message.controller.js` |
| Conversation Service | `src/services/conversation.service.js` |
| Message Service | `src/services/message.service.js` |
| Conversation Validation | `src/validations/conversation.validation.js` |
| Message Validation | `src/validations/message.validation.js` |
| Socket.IO / Real-time Communication | Messaging real-time implementation |
| Message Attachments | Messaging attachment implementation |

---

## 1. Overview

The Nexora Messaging module provides private communication between users who have an established connection.

Messaging is intentionally dependent on the Connection Management module. A user cannot create a conversation with an arbitrary user. The two users must have an accepted connection before communication is allowed.

The module separates conversation management from individual message management.

A `Conversation` represents the communication channel between two connected users, while a `Message` represents an individual piece of communication inside that conversation.

The messaging module also supports real-time communication through Socket.IO. Real-time functionality allows connected users to receive message updates, conversation activity updates, presence changes, typing indicators, and message delivery/read-state updates without requiring a page refresh.

The module additionally supports message attachments, allowing users to send supported attachment content as part of a conversation.

---

## 2. Objectives

The Messaging module is designed to:

- Allow connected users to communicate privately.
- Prevent messaging between users who are not connected.
- Prevent users from creating conversations with themselves.
- Maintain a single conversation for a connected user pair.
- Store messages independently from conversation metadata.
- Maintain the timestamp of the latest message.
- Support chronological message retrieval.
- Support pagination for conversation and message lists.
- Protect conversations through authenticated access.
- Expose only the user information required by the messaging client.
- Provide real-time messaging updates through Socket.IO.
- Track real-time user presence within the messaging system.
- Provide real-time typing indicators.
- Provide real-time message delivery receipts.
- Provide real-time message read receipts.
- Support message attachments.

---

## 3. Core Architecture

The Messaging module follows the Nexora layered backend architecture:

```text
Client
   ↓
Route
   ↓
Authentication / Validation Middleware
   ↓
Controller
   ↓
Service
   ↓
Model
   ↓
MongoDB
```

The controller layer remains intentionally thin.

Controllers are responsible for:

- Reading request data.
- Calling the appropriate service.
- Returning standardized API responses.

Business rules remain inside the service layer.

For real-time communication, the messaging system additionally uses a Socket.IO communication layer:

```text
Client
   ↕
Socket.IO
   ↕
Real-time Messaging Events
   ↕
Messaging / Application Services
   ↕
MongoDB
```

HTTP APIs are responsible for request-based operations such as retrieving conversations and messages, while Socket.IO is used to propagate real-time state and activity changes to connected clients.

---

## 4. Conversation and Message Relationship

The messaging system uses two primary MongoDB collections:

```text
Conversation
     │
     │ 1 : many
     ↓
  Message
```

A conversation contains the participants and conversation-level metadata.

Each message references exactly one conversation.

Each message also references the user who sent it.

The relationship can therefore be represented as:

```text
User A ───────┐
              │
              ↓
        Conversation
              │
              ├── Message 1
              ├── Message 2
              ├── Message 3
              └── Message N
              ↑
              │
User B ───────┘
```

Real-time events operate on top of this persistent relationship.

For example:

```text
Message Created
      ↓
Message persisted
      ↓
Conversation activity updated
      ↓
Relevant Socket.IO event emitted
      ↓
Connected client receives update
```

This allows persistent database state and real-time client state to remain synchronized.

---

## 5. Messaging Authorization Model

Messaging authorization is based on the user's authenticated identity and conversation membership.

Before accessing a conversation, the service verifies that:

```text
authenticated user ∈ conversation.participants
```

If the authenticated user is not a participant, access is denied.

Conversation creation has an additional requirement:

```text
Connection.status === "accepted"
```

This means Connection Management determines whether two users are allowed to communicate, while Messaging manages the communication itself.

Real-time socket communication follows the same authenticated-user and conversation-participant principles. Real-time events must not bypass the authorization rules enforced by the messaging system.

---

## 6. Conversation Activity

The Conversation model maintains the timestamp of the latest message to support conversation activity tracking.

When a new message is created, conversation activity is updated and the corresponding real-time conversation activity can be propagated to connected clients.

This allows the conversation list to reflect new message activity without requiring a browser refresh.

The real-time conversation-list behavior includes:

- New message activity appearing in the relevant conversation.
- Conversation ordering being updated according to recent activity.
- Latest-message information being synchronized with the client.
- Connected users receiving conversation updates through the real-time communication layer.

Detailed ordering and update behavior are documented in the API and data-model documentation.

---

## 7. Real-Time Communication

The Messaging module uses Socket.IO to provide real-time communication between connected clients.

Real-time communication is used for messaging-related events that need to be reflected immediately in the user interface.

The current implementation supports real-time updates for:

- User presence.
- Typing indicators.
- Message delivery receipts.
- Message read receipts.
- Conversation-list activity.
- Message-related notification count synchronization.

The general communication flow is:

```text
User Action
     ↓
Socket.IO Event
     ↓
Server-side Messaging Logic
     ↓
Relevant User / Conversation
     ↓
Socket.IO Event
     ↓
Connected Client
```

Real-time communication complements the existing HTTP API rather than replacing persistent API operations.

---

## 8. Real-Time Presence

The Messaging module supports real-time presence information through Socket.IO.

Presence allows the messaging interface to reflect whether a relevant user is currently connected to the real-time communication system.

The general flow is:

```text
User connects
     ↓
Socket.IO connection established
     ↓
Presence state updated
     ↓
Relevant clients receive presence update
```

When a user disconnects, the corresponding presence state is updated for other relevant clients.

Presence is used as a real-time communication feature and does not replace persistent user-account information.

---

## 9. Real-Time Typing Indicators

The Messaging module supports real-time typing indicators.

When a user begins typing inside a conversation, the relevant typing event is communicated through Socket.IO to the other participant.

The general flow is:

```text
User A starts typing
        ↓
Socket.IO typing event
        ↓
Server
        ↓
User B receives typing state
```

When typing stops, the corresponding state is cleared.

Typing indicators are transient real-time states and are not stored as permanent message records.

---

## 10. Message Delivery Receipts

The Messaging module supports real-time message delivery receipts.

A delivery receipt indicates that a sent message has reached the intended recipient's messaging client through the real-time communication flow. Delivery status is handled as part of the real-time messaging workflow and is distinct from the persistent read state of the message.

The general concept is:

```text
Message sent
     ↓
Message persisted
     ↓
Message delivered to recipient
     ↓
Delivery event processed
     ↓
Sender receives delivery update
```

Delivery receipts are separate from read receipts.

A message being delivered does not necessarily mean that the recipient has opened or read the message.

---

## 11. Message Read Receipts

The Messaging module supports real-time message read receipts.

A read receipt indicates that the recipient has viewed the relevant conversation state and that the corresponding message read state has been updated according to the application's read-state workflow.

The general flow is:

```text
Recipient opens conversation
        ↓
Unread messages are identified
        ↓
Read state is updated
        ↓
Real-time read event emitted
        ↓
Sender receives read update
```

This allows the sender's interface to update message read status without requiring a page refresh.

Read receipts are distinct from delivery receipts:

```text
Sent
  ↓
Delivered
  ↓
Read
```

The exact read-state persistence behavior is handled by the messaging service and message data model.

---

## 12. Conversation Read State and Notification Synchronization

When a recipient opens a conversation containing unread messages, the messaging interface updates the relevant message read state.

The notification interface is synchronized with the resulting message-read state.

For example:

```text
Manjula receives:

Message 1
Message 2

Notification count = 2
        ↓
Manjula opens Komala's conversation
        ↓
Messages become read
        ↓
Notification count decreases
        ↓
Navbar updates without page refresh
```

Similarly, when a notification is explicitly marked as read or all notifications are marked as read, the notification count is synchronized with the client without requiring a browser refresh.

This keeps the messaging UI and notification UI synchronized while preserving the separation of responsibilities between Messaging Management and Notification Management.

Notification persistence and notification business rules remain owned by the Notification Management module.

---

## 13. Message Attachments

The Messaging module supports message attachments in addition to normal text communication.

Attachments are associated with the relevant message and are handled through the messaging attachment implementation.

The messaging system therefore supports communication that may contain:

- Text content.
- Supported attachment content.

Attachment handling is performed as part of message creation and retrieval, while the configured file/media infrastructure is responsible for storing the attachment data.

Attachment access follows the same conversation authorization rules as normal messages.

A user who is not authorized to access a conversation must not be able to access its message attachments through the messaging system.

---

## 14. Pagination

Both conversation retrieval and message retrieval support pagination.

The supported parameters are:

- `page`
- `limit`

Pagination prevents the API from loading an unnecessarily large number of conversations or messages in a single request.

Real-time events complement pagination by informing already-connected clients about new activity after the initial data has been retrieved.

For example:

```text
Initial page load
      ↓
Retrieve messages using API
      ↓
Socket.IO connection
      ↓
Receive new messages in real time
```

This prevents the client from needing to repeatedly reload the entire conversation history simply to detect new activity.

---

## 15. Security and Privacy Principles

The Messaging module follows these principles:

- All messaging endpoints require authentication.
- Conversation access is restricted to participants.
- Conversation creation requires an accepted connection.
- Sender identity comes from the authenticated request.
- Passwords and authentication tokens are never returned through messaging APIs.
- Only required participant fields are populated.
- Location and discovery-location data are not exposed through conversation or message responses.
- Real-time communication must respect authenticated user identity.
- Socket events must not provide unauthorized access to conversations.
- Message attachments are protected by the same conversation authorization rules.
- Sensitive user information is not exposed through real-time messaging events.

---

## 16. Separation of Responsibilities

The Messaging module does not manage user relationships.

Responsibilities are separated as follows:

```text
Connection Management
        │
        │ Determines connection eligibility
        ▼
Messaging Management
        │
        ├── Manages conversations and messages
        │
        └── Generates messaging-related events
                    │
                    ├──────────► Real-Time Communication
                    │             Propagates live events
                    │
                    └──────────► Notification Management
                                  Manages persistent notifications
```

The modules remain responsible for their respective business domains.

Messaging is responsible for message and conversation activity.

Notification Management is responsible for persistent notification creation, retrieval, read state, and notification counts.

Real-time communication provides the mechanism through which relevant state changes can be synchronized with connected clients.

---

## 17. Current Messaging Scope

The current implementation supports:

- Private conversations between two connected users.
- Conversation creation.
- Existing conversation reuse.
- Conversation listing.
- Individual conversation retrieval.
- Message creation.
- Message retrieval.
- Sender population.
- Message timestamps.
- Conversation last-message tracking.
- Pagination.
- Participant authorization.
- Chronological message ordering.
- Socket.IO-based real-time communication.
- Real-time user presence.
- Real-time typing indicators.
- Real-time message delivery receipts.
- Real-time message read receipts.
- Real-time conversation-list updates.
- Chat message attachments.
- Real-time synchronization of message-related notification state.

---

## 18. Out of Scope

The current Messaging module does not yet implement:

- Message editing.
- Message deletion.
- Message reactions.
- Voice messages.
- Message search.
- Blocking.
- End-to-end message encryption.
- Browser push notification delivery.
- Mobile push notification delivery.
- Notification preferences.
- Notification grouping.

These features may be considered in future iterations.

---

## 19. Design Decisions

**Why require an accepted connection?**

Messaging is intended to be available only between established Nexora connections. This prevents arbitrary users from initiating private conversations with users who have not accepted the relationship.

**Why separate Conversation and Message?**

A conversation represents the communication channel, while messages represent individual communication events. Separating these entities allows conversation-level metadata such as `lastMessageAt` to be maintained independently from the potentially large number of messages.

**Why use `pairKey`?**

The connection already provides a normalized identifier for the user pair. Reusing that identifier ensures that the same connected pair maps to a single conversation rather than multiple duplicate conversations.

**Why authorize conversations in the service layer?**

Conversation membership is business logic. Keeping authorization inside the service provides a single enforcement point and prevents the frontend from becoming responsible for security decisions.

**Why populate only selected participant fields?**

The messaging client requires basic identity information such as:

- `_id`
- `name`
- `profilePic`

Sensitive or unrelated user information should not be returned unnecessarily. This follows the principle of minimizing API data exposure.

**Why use Socket.IO?**

HTTP APIs are appropriate for persistent operations such as retrieving conversations and message history, while Socket.IO provides a mechanism for delivering live messaging events to connected clients.

Using both allows Nexora to maintain persistent database state while providing an immediate user experience.

**Why separate delivery and read receipts?**

Delivery and read represent different stages of message processing.

```text
Message Sent
     ↓
Message Delivered
     ↓
Message Read
```

A delivered message does not necessarily mean that the recipient has opened or viewed it. Keeping these states conceptually separate allows the messaging interface to accurately represent message progress.

**Why use real-time conversation-list updates?**

A conversation list should immediately reflect new message activity. Real-time conversation updates prevent users from needing to refresh the page before seeing the latest conversation activity.

**Why keep notification management separate?**

Messaging generates message-related events, but persistent notification creation and notification read-state management belong to Notification Management.

This separation allows Messaging and Notification Management to evolve independently while still communicating through defined application events.

---

## 20. Integration With Other Nexora Modules

### Connection Management

Messaging depends on accepted connections.

```text
Connection.status = "accepted"
        ↓
Conversation creation allowed
```

Pending, rejected, cancelled, or removed relationships must not authorize new conversations.

### User Management

Messaging uses user records for participant and sender identity information.

### Authentication

All messaging endpoints require the authenticated user's identity through the existing JWT authentication middleware.

Real-time communication also operates in the context of authenticated users.

### Notification Management

Message activity can generate notification events.

```text
New Message
     ↓
Message Service
     ↓
Notification creation
     ↓
Notification Management
```

Notification Management remains responsible for:

- Notification persistence.
- Notification retrieval.
- Unread notification counts.
- Marking notifications as read.
- Marking all notifications as read.

Messaging only participates in the generation of the relevant message event.

### Real-Time Communication

Socket.IO provides the real-time transport used by the Messaging module for delivering messaging-related live events to connected clients.

The detailed real-time event responsibilities are documented in Section 22.

---

## 21. Real-Time Messaging Flow

The overall messaging flow can be represented as:

```text
User A
  |
  | sends message
  ↓
Message API / Messaging Service
  |
  ├── Validate authenticated identity
  |
  ├── Validate conversation access
  |
  ├── Create message
  |
  ├── Update conversation activity
  |
  ├── Generate notification event
  |
  └── Emit Socket.IO event
              |
              ↓
        User B's client
              |
              ├── New message appears
              ├── Conversation list updates
              └── Notification-related UI state synchronizes
```

When User B opens the conversation:

```text
User B opens conversation
        ↓
Unread messages identified
        ↓
Read state updated
        ↓
Socket.IO read event
        ↓
User A receives read update
        ↓
Notification state synchronized
```

This allows the messaging experience to remain synchronized across both participants without requiring browser refreshes.

---

## 22. Current Real-Time Event Responsibilities

The real-time messaging implementation is responsible for communicating transient or immediately relevant state changes.

### Presence Events

Used to communicate user connection and disconnection state.

### Typing Events

Used to communicate when a participant is currently typing.

### Message Events

Used to communicate newly available messages to connected participants.

### Delivery Events

Used to communicate message delivery state.

### Read Events

Used to communicate message read state.

### Conversation Events

Used to keep conversation-list activity synchronized with new messaging activity.

### Notification Synchronization

Used to keep the visible notification state synchronized with message-related user actions where the messaging and notification interfaces interact.

---

## 23. Data Persistence and Real-Time State

Nexora distinguishes between persistent application data and transient real-time state.

Persistent data includes:

```text
Users
Conversations
Messages
Notification records
```

Real-time state includes information such as:

```text
Online / offline presence
Typing state
Delivery events
Read-state events
Live conversation activity
```

Persistent state is stored in MongoDB, while Socket.IO is used to communicate live changes between the server and connected clients.

This separation prevents transient communication state from unnecessarily becoming permanent database data.

---

## 24. References

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [HTTP Semantics / RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [OWASP API Security Guidance](https://owasp.org/www-project-api-security/)

---

## 25. Revision History

| Version | Description |
|---------|-------------|
| 0.1 | Initial Messaging Management Module Overview |
| 0.2 | Updated documentation for real-time communication, Socket.IO presence, typing indicators, delivery receipts, read receipts, attachments, real-time conversation-list updates, and notification synchronization |
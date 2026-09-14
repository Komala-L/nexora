# Nexora Messaging Management Overview

> This document describes the architecture, responsibilities, business rules, and implementation principles of the Nexora Messaging module.
> It explains how Nexora creates conversations between connected users and manages messages within those conversations.

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Message Management |
| Document Type | Module Overview |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 14 September 2026 |

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

---

## 1. Overview

The Nexora Messaging module provides private communication between users who have an established connection.

Messaging is intentionally dependent on the Connection Management module. A user cannot create a conversation with an arbitrary user. The two users must have an accepted connection before communication is allowed.

The module separates conversation management from individual message management.

A `Conversation` represents the communication channel between two connected users, while a `Message` represents an individual piece of communication inside that conversation.

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

## 6. Conversation Activity

The Conversation model maintains the timestamp of the latest message to support conversation activity tracking.

Detailed ordering and update behavior are documented in the API and data-model documentation.

---

## 7. Pagination

Both conversation retrieval and message retrieval support pagination.

The supported parameters are:

- `page`
- `limit`

Pagination prevents the API from loading an unnecessarily large number of conversations or messages in a single request.

---

## 8. Security and Privacy Principles

The Messaging module follows these principles:

- All messaging endpoints require authentication.
- Conversation access is restricted to participants.
- Conversation creation requires an accepted connection.
- Sender identity comes from the authenticated request.
- Passwords and authentication tokens are never returned through messaging APIs.
- Only required participant fields are populated.
- Location and discovery-location data are not exposed through conversation or message responses.

---

## 9. Separation of Responsibilities

The Messaging module does not manage user relationships.

Responsibilities are separated as follows:

```text
Connection Management
        ↓
Determines whether users are connected
        ↓
Messaging
        ↓
Manages conversations and messages
        ↓
Notification Management
        ↓
Will later manage communication-related notifications
```

This separation keeps each module focused on a specific responsibility.

---

## 10. Current Messaging Scope

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

---

## 11. Out of Scope

The current Messaging module does not yet implement:

- WebSocket-based real-time messaging.
- Typing indicators.
- Read receipts or read-state management workflows.
- Message editing.
- Message deletion.
- Message reactions.
- File attachments.
- Voice messages.
- Message search.
- Blocking.
- Notification delivery.
- Message encryption beyond transport/application security mechanisms.

These features may be considered in future iterations.

---

## 12. Design Decisions

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

---

## 13. Integration With Other Nexora Modules

**Connection Management**

Messaging depends on accepted connections.

```text
Connection.status = "accepted"
        ↓
Conversation creation allowed
```

Pending, rejected, cancelled, or removed relationships must not authorize new conversations.

**User Management**

Messaging uses user records for participant and sender identity information.

**Authentication**

All messaging endpoints require the authenticated user's identity through the existing JWT authentication middleware.

**Notifications**

Notification delivery is intentionally outside the Messaging module. Future notification functionality may consume messaging events such as:

```text
New Message
```

without moving notification responsibilities into the Messaging service.

---

## 14. References

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [HTTP Semantics / RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [OWASP API Security Guidance](https://owasp.org/www-project-api-security/)

---

## 15. Revision History

| Version | Description |
|---------|-------------|
| 0.1 | Initial Messaging Management Module Overview |
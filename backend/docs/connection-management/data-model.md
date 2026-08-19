# Connection Data Model

## Document Information

  Property           Value
  ------------------ -----------------------
  Project            Nexora
  Module             Connection Management
  Document Type      Data Model Design
  Document Version   0.1
  Status             Active
  Review Status      Approved
  Author             Komala L
  Last Updated       19 August 2026

------------------------------------------------------------------------

# 1. Overview

Nexora uses a single `Connection` collection to represent both pending
connection requests and accepted relationships.

The same document changes state when a request is accepted. Rejected,
cancelled, and removed relationships are deleted rather than retained as
historical states.

The collection therefore represents the **current active relationship
state** between two users.

------------------------------------------------------------------------

# 2. Connection Document

The conceptual model is:

``` text
Connection
│
├── requester
│     └── ObjectId → User
│
├── recipient
│     └── ObjectId → User
│
├── pairKey
│     └── unique relationship identity
│
├── status
│     ├── pending
│     └── accepted
│
├── createdAt
└── updatedAt
```

## Fields

  Field         Purpose
  ------------- --------------------------------------------------
  `requester`   User who initiated the connection request
  `recipient`   User who received the request
  `pairKey`     Normalized identity of the two-user relationship
  `status`      Current active relationship state
  `createdAt`   Creation timestamp
  `updatedAt`   Last modification timestamp

------------------------------------------------------------------------

# 3. Requester and Recipient

A connection request is directional.

For example:

``` text
A → B
```

means:

-   A is the `requester`.
-   B is the `recipient`.

This distinction is required because only the recipient can accept or
reject a pending request, while only the requester can cancel it.

After acceptance, the same document represents the established
relationship.

------------------------------------------------------------------------

# 4. Relationship Identity

Every pair of users has one normalized `pairKey`.

For example:

``` text
User A = 123
User B = 456
```

The normalized relationship identity is:

``` text
123:456
```

The reverse ordering:

``` text
456:123
```

must resolve to the same relationship identity.

This creates the fundamental invariant:

> For any pair of users, Nexora can have at most one active Connection
> document.

------------------------------------------------------------------------

# 5. Status

The `status` field represents the current active relationship state.

Only two values are persisted:

``` text
pending
accepted
```

### `pending`

A connection request exists and the recipient has not yet accepted it.

### `accepted`

The recipient has accepted the request and the users are connected.

Rejected, cancelled, and removed states are not persisted.

------------------------------------------------------------------------

# 6. Timestamps

The Connection document maintains:

-   `createdAt`
-   `updatedAt`

These timestamps are used to identify when the relationship document was
created and when its current state was last modified.

------------------------------------------------------------------------

# 7. Database Integrity

The `pairKey` field must be unique.

The integrity strategy is:

``` text
Service Validation
       ↓
Duplicate Detection
       ↓
MongoDB Unique Constraint
```

Service-level validation handles expected duplicate and state checks.

The database-level unique constraint provides a final protection against
duplicate relationship documents, including concurrent creation
attempts.

------------------------------------------------------------------------

# 8. Relationship With User

The Connection document references users through:

``` text
requester → User
recipient → User
```

The Connection collection does not duplicate user profile or location
data.

Connection responses must expose only the limited user information
required by the client.

Sensitive fields such as:

``` text
email
password
refreshToken
location
discoveryLocation
```

must not be exposed through Connection APIs.

------------------------------------------------------------------------

# 9. Location Privacy Boundary

Connection documents must not contain:

``` text
location
discoveryLocation
```

Nearby Discovery determines which users are nearby, while Connection
Management determines the relationship between users.

This keeps location discovery and relationship management separate.

------------------------------------------------------------------------

# 10. Design Decisions

## Why use one Connection collection?

A single collection represents both pending requests and accepted
relationships using one relationship document.

This avoids unnecessary duplication between separate request and
connection collections.

## Why use requester and recipient?

The relationship begins as a directional request, so the system must
know who initiated it and who must respond.

## Why use pairKey?

`pairKey` provides a normalized identity for the user pair and prevents
`A → B` and `B → A` from being treated as separate relationships.

## Why store only pending and accepted?

The Connection collection represents current active relationships rather
than relationship history.

Rejected, cancelled, and removed relationships are deleted.

------------------------------------------------------------------------

# 11. Out of Scope

This document does not cover:

-   Authentication.
-   User profile management.
-   Nearby user discovery.
-   Chat messages.
-   Notifications.
-   Relationship history.
-   Blocking.

------------------------------------------------------------------------

# 12. Revision History

  Version   Description
  --------- --------------------------------------
  0.1       Initial Connection Data Model Design
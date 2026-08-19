# Connection Relationship State Machine

## Document Information

  Property           Value
  ------------------ -----------------------
  Project            Nexora
  Module             Connection Management
  Document Type      State Machine Design
  Document Version   0.1
  Status             Active
  Review Status      Approved
  Author             Komala L
  Last Updated       19 August 2026

------------------------------------------------------------------------

# 1. Overview

The Connection Management module uses a small state machine to represent
the current relationship between two users.

Only two relationship states are persisted:

``` text
pending
accepted
```

Other outcomes are represented by deleting the Connection document.

------------------------------------------------------------------------

# 2. Relationship Lifecycle

``` text
                     SEND REQUEST
                          ↓
                   ┌─────────────┐
                   │   PENDING   │
                   └──────┬──────┘
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
           ACCEPT                   REJECT
              ↓                       ↓
       ┌──────────────┐            DELETE
       │   ACCEPTED   │
       └───────┬──────┘
               │
          DISCONNECT
               ↓
            DELETE
```

Cancellation follows:

``` text
PENDING
   │
   │ requester cancels
   ↓
 DELETE
```

------------------------------------------------------------------------

# 3. Pending State

A relationship enters `pending` when a user successfully sends a
connection request.

Example:

``` text
A → B
status = pending
```

While pending:

-   The recipient can accept.
-   The recipient can reject.
-   The requester can cancel.
-   Neither user can create another relationship with the other user.
-   A reverse request is not created.

------------------------------------------------------------------------

# 4. Accepted State

When the recipient accepts:

``` text
pending → accepted
```

The existing Connection document is updated.

A second Connection document is not created.

Example:

``` text
A → B
status = accepted
```

At this point, A and B are connected.

The accepted relationship later acts as the authorization prerequisite
for Chat.

------------------------------------------------------------------------

# 5. Rejection

When the recipient rejects a pending request:

``` text
pending → DELETE
```

There is no persisted `rejected` state.

The Connection collection therefore continues to represent only active
relationships.

------------------------------------------------------------------------

# 6. Cancellation

When the requester cancels a pending request:

``` text
pending → DELETE
```

Only the requester can perform this operation.

------------------------------------------------------------------------

# 7. Removal

When two users are already connected, either connected user may remove
the relationship:

``` text
accepted → DELETE
```

Only an accepted relationship can be removed through the disconnect
operation.

------------------------------------------------------------------------

# 8. Allowed Transitions

  Current State   Action                          Result
  --------------- ------------------------------- ------------
  None            Send request                    `pending`
  `pending`       Recipient accepts               `accepted`
  `pending`       Recipient rejects               Delete
  `pending`       Requester cancels               Delete
  `accepted`      Either connected user removes   Delete

------------------------------------------------------------------------

# 9. Forbidden Transitions

The following operations are not allowed:

``` text
accepted → pending
```

``` text
pending → pending
```

through another request.

``` text
pending → accepted
```

through a reverse request.

A user also cannot accept or reject a request unless they are the
recipient.

A user cannot cancel a request unless they are the requester.

------------------------------------------------------------------------

# 10. Relationship Invariant

For any pair of users:

> At most one active Connection document may exist.

The active relationship can therefore be either:

``` text
pending
```

or:

``` text
accepted
```

but never both simultaneously.

------------------------------------------------------------------------

# 11. Why Deleted States Are Not Persisted

The Connection collection answers:

> What is the current relationship between these users?

It does not answer:

> What has ever happened between these users?

If Nexora later requires relationship history, audit logs, request
history, or moderation records, those concerns should be implemented
through a separate history or event mechanism.

------------------------------------------------------------------------

# 12. Chat Authorization

The Connection state establishes the relationship boundary for Chat.

The future Chat module should verify:

``` text
Connection.status === "accepted"
```

before allowing conversation.

A pending relationship must not authorize communication.

------------------------------------------------------------------------

# 13. Notification Integration

Connection state changes may later generate events for the Notification
module.

Examples include:

``` text
Connection Request Created
Connection Request Accepted
```

Notification delivery remains outside the Connection module.

------------------------------------------------------------------------

# 14. Design Decision

The state machine intentionally remains small.

Nexora will not persist:

``` text
rejected
cancelled
removed
```

as Connection states.

This keeps the Connection collection focused on active relationship
state and avoids turning it into a historical event log.

------------------------------------------------------------------------

# 15. Revision History

  Version   Description
  --------- ------------------------------------------------------
  0.1       Initial Connection Relationship State Machine Design

# Connection Request Strategy

## Document Information

  Property           Value
  ------------------ -------------------------
  Project            Nexora
  Module             Connection Management
  Document Type      Request Strategy Design
  Document Version   0.1
  Status             Active
  Review Status      Approved
  Author             Komala L
  Last Updated       19 August 2026

------------------------------------------------------------------------

# 1. Overview

The Connection Management module uses a single relationship document for
connection requests and accepted connections.

The request strategy is designed to prevent duplicate relationships,
reverse-pending requests, inconsistent state transitions, and
unauthorized relationship operations.

------------------------------------------------------------------------

# 2. Core Invariant

For any pair of users:

> Nexora can have at most one active Connection document.

This invariant is enforced through:

``` text
Service Validation
       ↓
Business Rules
       ↓
Unique pairKey Constraint
```

------------------------------------------------------------------------

# 3. Self-Request Prevention

A user cannot send a connection request to themselves.

``` text
A → A
```

must always fail.

------------------------------------------------------------------------

# 4. Duplicate Request

Suppose:

``` text
A → B
status = pending
```

If A tries to send another request to B:

``` text
A → B
```

the service must reject the request.

A second document must never be created.

------------------------------------------------------------------------

# 5. Reverse Request

Suppose:

``` text
A → B
status = pending
```

and B attempts:

``` text
B → A
```

The service normalizes the user pair into the same `pairKey`.

Therefore, the existing relationship is found.

The system must:

``` text
❌ Not create another document
❌ Not automatically accept the existing request
✅ Return a conflict/existing-request response
```

The original request remains pending.

------------------------------------------------------------------------

# 6. Reverse Request Is Not Auto-Accepted

A reverse request does not automatically change:

``` text
pending → accepted
```

The recipient must explicitly accept the original request.

This makes the relationship lifecycle predictable and keeps the
authorization rules clear.

------------------------------------------------------------------------

# 7. Existing Accepted Connection

Suppose:

``` text
A ↔ B
status = accepted
```

A new request between A and B must fail.

The system must not create another Connection document.

------------------------------------------------------------------------

# 8. Requester Authorization

For:

``` text
A → B
status = pending
```

only A can cancel the request.

B cannot cancel A's outgoing request.

------------------------------------------------------------------------

# 9. Recipient Authorization

For:

``` text
A → B
status = pending
```

only B can:

-   Accept the request.
-   Reject the request.

A cannot accept their own outgoing request.

------------------------------------------------------------------------

# 10. Connection Removal

For:

``` text
A ↔ B
status = accepted
```

either A or B can remove the connection.

After removal:

``` text
accepted → DELETE
```

The relationship document is deleted.

------------------------------------------------------------------------

# 11. Duplicate Prevention

The service checks for:

-   Self-request.
-   Existing pending relationship.
-   Existing accepted relationship.
-   Reverse pending relationship.

MongoDB additionally enforces uniqueness on:

``` text
pairKey
```

The database constraint protects the system against concurrent requests
that might otherwise create duplicate relationships.

------------------------------------------------------------------------

# 12. Request Processing Strategy

A new request conceptually follows:

``` text
Authenticated User
       ↓
Validate target user
       ↓
Prevent self-request
       ↓
Generate normalized pairKey
       ↓
Check existing relationship
       ↓
Reject duplicate/reverse/accepted relationship
       ↓
Create pending Connection
```

The authenticated user is always taken from:

``` text
req.user.id
```

The client must never provide the requester identity.

------------------------------------------------------------------------

# 13. Error Strategy

Relationship conflicts use HTTP `409 Conflict` where appropriate.

Example:

``` json
{
    "success": false,
    "statusCode": 409,
    "message": "Connection request already exists",
    "errorCode": "CONNECTION_ALREADY_EXISTS"
}
```

The frontend should use the machine-readable `errorCode` for
programmatic behavior rather than parsing the human-readable message.

------------------------------------------------------------------------

# 14. Resource Protection

For protected request resources, the service should avoid unnecessarily
revealing whether another user's private relationship resource exists.

For example, an unauthorized access to another user's protected request
resource may return:

``` text
404 Not Found
```

instead of exposing the resource through:

``` text
403 Forbidden
```

This reduces relationship-resource enumeration.

------------------------------------------------------------------------

# 15. Location Privacy

Connection requests and relationships must not store or expose:

``` text
location
discoveryLocation
```

Nearby Discovery and Connection Management remain separate
responsibilities.

Connection Management only needs the user relationship and limited
public profile information required by the client.

------------------------------------------------------------------------

# 16. Design Decisions

## Why use one relationship document?

It prevents duplicate relationship representations and makes state
transitions straightforward.

## Why use pairKey?

It treats:

``` text
A → B
```

and:

``` text
B → A
```

as the same relationship identity.

## Why not auto-accept reverse requests?

Explicit acceptance keeps the relationship lifecycle predictable and
avoids hidden state transitions.

## Why combine service validation with a database constraint?

Service validation provides clear business errors, while the unique
database constraint provides final data-integrity protection against
concurrent duplicate creation.

------------------------------------------------------------------------

# 17. Out of Scope

This document does not cover:

-   User authentication implementation.
-   User profile management.
-   Nearby Discovery implementation.
-   Chat implementation.
-   Notification delivery.
-   Relationship history.
-   Blocking.

------------------------------------------------------------------------

# 18. Revision History

  Version   Description
  --------- --------------------------------------------
  0.1       Initial Connection Request Strategy Design
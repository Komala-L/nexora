# Connection Relationship State Machine

## Document Information

| Property         | Value                 |
| ---------------- | --------------------- |
| Project          | Nexora                |
| Module           | Connection Management |
| Document Type    | State Machine Design  |
| Document Version | 0.2                   |
| Status           | Active                |
| Review Status    | Approved              |
| Author           | Komala L              |
| Last Updated     | 31 August 2026        |

---

# 1. Overview

The Connection Management module uses a small state machine to represent the current relationship between two users.

Only two relationship states are persisted:

```text id="b5p7k2"
pending
accepted
```

Rejected, cancelled, and removed relationships are represented by deleting the Connection document rather than storing them as permanent states.

---

# 2. Relationship Lifecycle

The complete relationship lifecycle is:

```text id="i3f3s7"
                 SEND REQUEST
                      ↓
               ┌─────────────┐
               │   PENDING   │
               └──────┬──────┘
                      │
             ┌────────┴────────┐
             ↓                 ↓
          ACCEPT             REJECT
             ↓                 ↓
      ┌──────────────┐       DELETE
      │   ACCEPTED   │
      └───────┬──────┘
              │
          REMOVE
              ↓
           DELETE
```

A pending request can also be cancelled by the requester:

```text id="0y5w4a"
PENDING
   │
   │ requester cancels
   ↓
DELETE
```

---

# 3. Persisted States

The Connection model persists only two states.

## 3.1 Pending

```text id="5kvx9v"
pending
```

Represents a connection request that has been created but has not yet been accepted.

Example:

```text id="f0g3kw"
A → B
status = pending
```

## 3.2 Accepted

```text id="qg9v0j"
accepted
```

Represents an established connection between two users.

Example:

```text id="y3l7yc"
A ↔ B
status = accepted
```

The same Connection document changes from `pending` to `accepted`.

---

# 4. State Transitions

## 4.1 Create Request

Initial state:

```text id="z6m1l4"
NONE
```

Action:

```text id="xq7e2k"
Send connection request
```

Result:

```text id="c5v8my"
pending
```

---

## 4.2 Accept Request

Current state:

```text id="7m4w1v"
pending
```

Action:

```text id="r5b9qz"
Recipient accepts
```

Result:

```text id="j4r3kp"
accepted
```

Transition:

```text id="kq6e1n"
pending → accepted
```

The existing Connection document is updated. A new document is not created.

---

## 4.3 Reject Request

Current state:

```text id="n7f2qx"
pending
```

Action:

```text id="v9p3kd"
Recipient rejects
```

Result:

```text id="m6r4yx"
DELETE
```

Transition:

```text id="q8d2la"
pending → DELETE
```

No `rejected` state is persisted.

---

## 4.4 Cancel Request

Current state:

```text id="s4k9we"
pending
```

Action:

```text id="u2p7bc"
Requester cancels
```

Result:

```text id="t5n8mh"
DELETE
```

Transition:

```text id="x3c6rq"
pending → DELETE
```

---

## 4.5 Remove Connection

Current state:

```text id="b8j4zn"
accepted
```

Action:

```text id="d6p2ws"
Either connected user removes the connection
```

Result:

```text id="h7q1mv"
DELETE
```

Transition:

```text id="e9r5ka"
accepted → DELETE
```

---

# 5. Allowed Transitions

| Current State | Action                        | Result     |
| ------------- | ----------------------------- | ---------- |
| None          | Send request                  | `pending`  |
| `pending`     | Recipient accepts             | `accepted` |
| `pending`     | Recipient rejects             | Delete     |
| `pending`     | Requester cancels             | Delete     |
| `accepted`    | Either connected user removes | Delete     |

---

# 6. Forbidden Transitions

The following state transitions are not allowed:

```text id="j4x8fw"
accepted → pending
```

An accepted connection cannot be converted back into a pending request.

```text id="k9q2sd"
pending → pending
```

A second request cannot create another pending relationship for the same user pair.

```text id="w3m7zc"
pending → accepted
```

through a reverse request.

A reverse request does not automatically accept an existing pending request.

The recipient must explicitly accept the original request.

---

# 7. Authorization Boundaries

State transitions are also subject to relationship-level authorization.

| Transition             | Authorized User       |
| ---------------------- | --------------------- |
| None → `pending`       | Authenticated user    |
| `pending` → `accepted` | Recipient             |
| `pending` → Delete     | Recipient             |
| `pending` → Delete     | Requester             |
| `accepted` → Delete    | Either connected user |

Authorization is enforced by the Connection service.

Detailed authorization and API behavior are documented in `api.md`.

---

# 8. Relationship Invariant

For any pair of users:

> At most one active Connection document may exist.

Therefore, a user pair can have only one of the following active states:

```text id="x6z9kr"
pending
```

or:

```text id="n2c5vp"
accepted
```

but never both simultaneously.

The normalized `pairKey` and database uniqueness constraint support this invariant.

---

# 9. Deleted States

Nexora does not persist the following as Connection states:

```text id="g5s7nm"
rejected
cancelled
removed
```

Instead, the Connection document is deleted.

Therefore:

```text id="e8q1yw"
pending → DELETE
accepted → DELETE
```

This keeps the Connection collection focused on the current active relationship.

---

# 10. Why Deleted States Are Not Persisted

The Connection collection answers:

> What is the current relationship between these users?

It does not answer:

> What has ever happened between these users?

Persisting rejected, cancelled, or removed states would turn the Connection collection into a relationship history store.

If Nexora later requires relationship history, audit logs, request history, or moderation records, those concerns should be implemented through a separate history or event mechanism.

---

# 11. State Machine and Chat

An accepted Connection establishes the relationship prerequisite for future Chat functionality.

The future Chat module should verify:

```text id="h3r6pb"
Connection.status === "accepted"
```

before allowing communication.

Pending or deleted relationships must not authorize communication.

---

# 12. State Machine and Notifications

Connection state changes may later generate events for the Notification module.

Examples include:

```text id="m7q2zx"
Connection Request Created
Connection Request Accepted
```

Notification delivery remains outside the Connection Management module.

---

# 13. Design Decision

The state machine intentionally remains small.

The Connection collection represents **current active relationship state**, not historical events.

Therefore:

```text id="t8w3ny"
Persisted:
    pending
    accepted

Not persisted:
    rejected
    cancelled
    removed
```

This keeps relationship state predictable and avoids unnecessary historical states in the Connection collection.

---

# 14. Related Documents

| Document              | Purpose                                |
| --------------------- | -------------------------------------- |
| `overview.md`         | Connection Management module overview  |
| `api.md`              | Connection Management API contracts    |
| `data-model.md`       | Connection schema and database design  |
| `request-strategy.md` | Duplicate and reverse-request handling |

---

# 15. Revision History

| Version | Description                                                                              |
| ------- | ---------------------------------------------------------------------------------------- |
| 0.1     | Initial Connection Relationship State Machine Design                                     |
| 0.2     | Updated state machine to reflect the implemented relationship lifecycle and API behavior |

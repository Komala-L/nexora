# Settings Management Data Model

## Document Information

| Property | Value |
|---|---|
| Project | Nexora |
| Module | Settings Management |
| Document Type | Data Model |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 22 September 2026 |

---

## 1. Overview

The Settings module primarily uses the User model to store user-specific configuration and account information.

The Settings functionality does not introduce a separate Settings collection.

Instead, settings are stored directly within the user's document.

```text
User
│
├── Discovery Preferences
│   ├── discoveryPreferences
│   └── isDiscoverable
│
├── Security
│   └── password
│
├── Account Information
│   ├── name
│   ├── email
│   ├── gender
│   └── createdAt
│
└── Account Lifecycle
    └── _id
```

This approach keeps settings associated directly with the authenticated user's account.

---

## 2. Implementation Location

| Component | Location |
|---|---|
| User Model | `backend/src/models/user.model.js` |
| Settings Service | `backend/src/services/settings.service.js` |
| Security Service | `backend/src/services/security.service.js` |
| Account Controller | `backend/src/controllers/account.controller.js` |
| Settings Validation | `backend/src/validations/settings.validation.js` |
| Security Validation | `backend/src/validations/security.validation.js` |
| Account Validation | `backend/src/validations/account.validation.js` |

---

## 3. User Model

The Settings module uses the existing User MongoDB collection.

The relevant fields are stored directly inside the user document.

Example structure:

```text
User
│
├── _id
├── name
├── gender
├── email
├── password
├── discoveryPreferences
├── isDiscoverable
├── createdAt
└── updatedAt
```

The User model also contains other application fields that are not directly managed by the current Settings interface.

---

## 4. Discovery Preferences

The `discoveryPreferences` field determines the types of people the user wants Nexora to help them discover.

```js
discoveryPreferences: {
    type: [String],
    enum: ["friends", "professional", "learning"],
    default: ["friends"],
}
```

**Supported Values**

| Value | Purpose |
|---|---|
| `friends` | Discover people interested in making new connections |
| `professional` | Discover people based on professional interests and goals |
| `learning` | Discover people with similar learning interests and goals |

A user can select one or more supported preferences.

The Settings validation limits the number of selected preferences to a maximum of three.

```text
Minimum: 1
Maximum: 3
```

The default value for a new user is:

```js
["friends"]
```

---

## 5. Privacy / Discoverability

Privacy is represented by the `isDiscoverable` field.

```js
isDiscoverable: {
    type: Boolean,
    default: true,
}
```

The field controls whether the user's profile can appear in discovery results.

```text
isDiscoverable = true
        ↓
Privacy disabled
        ↓
Profile can appear in Discovery


isDiscoverable = false
        ↓
Privacy enabled
        ↓
Profile is hidden from Discovery
```

The Settings UI presents this behavior as a **Private Profile** toggle.

Therefore, the UI meaning is intentionally different from the raw database field name.

**Default Behavior**

New users have:

```js
isDiscoverable = true
```

This means their profile is discoverable by default.

---

## 6. Settings Storage

Settings values are stored directly in the User document.

The Settings service updates only the fields supplied in a Settings update request:

- `discoveryPreferences`
- `isDiscoverable`

No separate Settings document or Settings collection is created.

The User document remains the source of truth for these settings.

---

## 7. Password Field

The user's password is stored in the User model.

```js
password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false,
}
```

The select: false configuration prevents the password field from being returned by normal User queries.

The password field is explicitly selected only when required for password-related operations.

Detailed password hashing and verification behavior is documented in security.md.

That gives the Data Model document the relevant information without duplicating your Security document.

---

## 8. Account Information

The Account section currently displays information already stored in the User model.

**Name**

```js
name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 40,
    trim: true,
}
```

The Account section displays the user's name as read-only information.

**Email**

```js
email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
}
```

The Account section displays the user's email address.

**Gender**

```js
gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
}
```

The Account section displays the stored gender value.

**Account Created**

The User schema uses:

```js
timestamps: true
```

This automatically provides:

- `createdAt`
- `updatedAt`

The Account section uses `createdAt` to display when the Nexora account was created.

---

## 9. Fields Outside the Current Settings Scope

The User model contains additional fields that are not currently managed by the Settings interface.

Examples include:

- `profilePic`
- `bio`
- `interests`
- `discoveryEnabled`
- `notificationPreferences`
- `professional`
- `learning`
- `location`
- `discoveryLocation`
- `refreshToken`

These fields belong to other Nexora functionality or future Settings functionality.

In particular, `discoveryEnabled` exists in the User model but is not currently read or updated by the Settings service.

Therefore, it is not treated as an active Settings control in the current implementation.

---

## 10. Timestamps

The User schema enables Mongoose timestamps:

```js
{
    timestamps: true
}
```

This provides:

- `createdAt`
- `updatedAt`

`createdAt` is used by the Account section to display the account creation date.

`updatedAt` is maintained automatically by Mongoose.

---

## 11. Data Storage Relationship

The Settings module uses the existing User model as its primary data source.

```text
Settings
   ↓
User Model
   ↓
User Document
   ↓
MongoDB
```

The Settings-related fields are stored directly within the User document rather than in a separate Settings collection.

---

## 12. Design Decisions

**Why store settings in the User model?**

The current Settings functionality contains user-specific configuration that directly affects the user's discovery behavior.

Keeping these values inside the User document avoids introducing an additional Settings collection.

**Why use `isDiscoverable`?**

The database field represents the actual discovery state of the user.

The UI presents the inverse concept as Private Profile, allowing the user to understand the setting as:

```text
Privacy ON
→ Profile hidden

Privacy OFF
→ Profile visible
```

**Why use `select: false` for password?**

Password data should not be returned through normal User queries.

Explicit selection is required when password verification is necessary.

**Why verify the current password?**

Changing a password and permanently deleting an account are security-sensitive operations.

Requiring the current password provides an additional verification step.

---

## 13. Current Data Model Scope

The current Settings implementation supports:

- Discovery preference storage.
- Discovery preference updates.
- Profile discoverability control.
- Password verification.
- Password changes.
- Account information display.
- Account creation date display.
- Account deletion.
- Related connection deletion.
- Related conversation deletion.
- Related message deletion.
- Related notification deletion.

---

## 14. References

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

---

## 15. Revision History

| Version | Description |
|---|---|
| 0.1 | Initial Settings Management Data Model documentation |
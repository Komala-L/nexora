# Settings Management Security

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Settings Management |
| Document Type | Security |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 22 September 2026 |

---

## 1. Overview

The Settings module contains operations that can directly affect a user's account.

These operations include:

- Updating discovery preferences.
- Changing the account password.
- Enabling or disabling profile discoverability.
- Viewing account information.
- Permanently deleting the account.

Because these operations involve account configuration and sensitive authentication information, the Settings module requires authenticated access and additional password verification for sensitive operations.

---

## 2. Authentication

Settings endpoints use the existing Nexora JWT authentication system.

Authenticated requests are identified through the existing authentication middleware:

```text
verifyJWT
```

The authenticated user's ID is obtained from:

```text
req.user._id
```

The Settings service uses this ID instead of accepting a user ID from the client.

This prevents a client from selecting another user's account through the request body or URL.

---

## 3. Protected Settings Routes

The Settings router applies authentication to its routes:

| Operation                  | Authentication |
| -------------------------- | -------------- |
| GET `/settings`            | Required       |
| PATCH `/settings`          | Required       |
| PATCH `/security/password` | Required       |
| DELETE `/settings/account` | Required       |

---

## 4. User Ownership

Settings are always associated with the currently authenticated user.

The service receives:

```text
req.user._id
```

and uses that value to locate the User document.

```text
Authenticated User
        ↓
req.user._id
        ↓
User.findById(userId)
        ↓
User's Settings
```

The client does not provide a target user ID for Settings operations.

This keeps Settings operations scoped to the authenticated account.

---

## 5. Discovery Settings Security

Discovery settings are not sensitive authentication credentials, but they control how the user's profile participates in Nexora discovery.

The relevant fields are:

```text
discoveryPreferences
isDiscoverable
```

The user can control these values through the Settings interface.

When:

```text
isDiscoverable = false
```

the user's profile is configured as private and should not appear in discovery results.

---

## 6. Password Protection

Passwords are protected at the User model level.

The password field uses:

```javascript
select: false
```

This prevents the password from being returned through normal User queries.

The password must be explicitly selected when required for password verification:

```javascript
User.findById(userId).select("+password")
```

---

## 7. Password Hashing

Passwords are hashed using `bcryptjs` in the User model's pre-save hook.

The hook runs when the password field is modified.

This means the plain-text password is not intentionally stored in the database.

The same hashing mechanism applies when a user changes their password because the password is modified and the User document is saved.

---

## 8. Current Password Verification

Password-sensitive operations require verification of the user's current password.

The User model provides:

```javascript
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
```

The Security service uses this method before changing the password.

The account deletion service also uses the same verification mechanism.

```text
Current Password
       ↓
comparePassword()
       ↓
Password Match
   ↙         ↘
Yes           No
 ↓             ↓
Continue      Reject
```

---

## 9. Password Change Protection

Changing a password requires:

- Current Password
- New Password
- Confirm New Password

If the current password is incorrect, the password is not changed.

---

## 10. Preventing Password Reuse

The Security service checks whether the new password is the same as the current password.

```javascript
const isSamePassword =
    await user.comparePassword(newPassword);
```

If the passwords match, the request is rejected:

```text
New password must be different from your current password
```

This prevents a user from changing their password to the exact same password.

---

## 11. Password Complexity

The password validation requires the new password to contain:

- At least 8 characters.
- At least one lowercase letter.
- At least one uppercase letter.
- At least one number.
- At least one supported special character.

These requirements are enforced by:

```text
changePasswordSchema
```

The validation occurs before the Security service performs the password update.

---

## 12. Account Deletion Protection

Account deletion is a permanent operation.

The current password is therefore required before the deletion can proceed.

The process is:

```text
Delete Account
      ↓
Current Password
      ↓
Backend Validation
      ↓
Password Verification
      ↓
Delete Related Data
      ↓
Delete User
```

If the current password is incorrect, account deletion is rejected.

---

## 13. Delete Account Confirmation

The frontend provides an additional confirmation step.

Before submitting the deletion request, the user must type:

```text
DELETE
```

The frontend also requires the current password.

This creates two intentional confirmation steps:

```text
Current Password
       +
Type DELETE
       ↓
Delete Account
```

The backend currently validates the password. The `DELETE` text confirmation is enforced by the Settings UI.

---

## 14. Related Data Deletion

Account deletion removes:

1. Connections involving the user.
2. Messages belonging to the user's conversations.
3. Conversations involving the user.
4. Notifications belonging to the user.
5. The User document.

---

## 15. Authentication Cookie Cleanup

After successful account deletion, the account controller clears the authentication cookies:

```javascript
res.clearCookie("accessToken");
res.clearCookie("refreshToken");
```

This removes the authentication credentials from the browser after the account has been deleted.

The client is then redirected to the registration page.

---

## 16. Sensitive Data Exposure

The Settings implementation avoids returning passwords through normal User queries.

The Account section displays only the account information required by the interface.

The current Account section displays:

```text
name
email
gender
createdAt
```

The password is not displayed.

Sensitive authentication values such as the stored password hash are not part of the Account UI.

---

## 17. Input Validation

All Settings-related user input passes through validation schemas.

The validation layer checks:

```text
Discovery Preferences
        ↓
Allowed values + limits

Password Change
        ↓
Password format + confirmation

Account Deletion
        ↓
Current password presence
```

Validation prevents malformed input from reaching the service layer.

- Strict Settings Validation

The Settings update schema uses:

```javascript
.strict()
```

This ensures that the Settings API accepts only fields defined by the current Settings contract.

---

## 18. Service-Layer Security

Security-sensitive business rules remain inside the backend service layer.

The frontend cannot determine whether a password is correct.

The backend performs the actual verification.

This prevents the client from becoming the authority for security decisions.

---

## 19. Client-Side Security Considerations

The Settings UI uses password inputs for sensitive password fields.

Password visibility can be toggled using the eye control.

This only changes how the password is displayed in the interface.

It does not change how the password is transmitted or stored.

The frontend sends requests using:

```javascript
credentials: "include"
```

which allows the existing authentication cookies to be included with the API request.

---

## 20. Error Handling

Security-sensitive failures are handled through the backend error-handling system.

Examples include:

```text
User not found
Current password is incorrect
New password must be different from your current password
Validation failed
```

The backend does not return the stored password or password hash as part of these errors.

---

## 21. Security Responsibilities

Security responsibilities are separated between layers.

### Frontend

Responsible for:

- Password input.
- Password visibility controls.
- Delete confirmation.
- Displaying success and error messages.
- Sending authenticated requests.

### Validation Layer

Responsible for:

- Input structure.
- Required fields.
- Password complexity.
- Password confirmation.
- Allowed Settings fields.

### Service Layer

Responsible for:

- User lookup.
- Current password verification.
- Password comparison.
- Password update.
- Account deletion.

### User Model

Responsible for:

- Password hashing.
- Password comparison.
- Password field protection.

---

## 22. Current Security Scope

The current Settings implementation provides:

- JWT-authenticated Settings access.
- User-scoped Settings operations.
- Password hashing.
- Password query protection.
- Current password verification.
- Password complexity validation.
- Password confirmation validation.
- Prevention of unchanged passwords.
- Password verification before account deletion.
- Delete-account confirmation in the UI.
- Related account-data deletion.
- Authentication cookie cleanup after deletion.
- Strict Settings input validation.

---

## 23. Security Limitations

The current Settings implementation does not yet include:

- Multi-factor authentication
- Password reset
- Email-change verification
- Session/device management
- Account recovery
- Security activity history
- Login notifications

These features can be introduced as the authentication and account-management requirements of Nexora expand.

---

## 24. Design Decisions

### Why verify the current password?

Password changes and account deletion directly affect account security. Requiring the current password provides an additional authentication check for these operations.

### Why hash passwords?

Plain-text passwords should not be stored in the database. The User model hashes passwords before persistence.

### Why use `select: false`?

The password field should not be included in ordinary User queries. Explicit selection is required only when password verification is necessary.

### Why keep security checks in the backend?

Security decisions must not depend on frontend behavior. The backend independently verifies passwords and performs authorization-sensitive operations.

### Why clear authentication cookies after deletion?

Once the account has been deleted, the associated authentication cookies should no longer remain active in the browser.

---

## 25. References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)

---

## 26. Revision History

| Version | Description |
|---------|-------------|
| 0.1 | Initial Settings Management Security documentation |
# Settings Management Validation

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Settings Management |
| Document Type | Validation |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 22 September 2026 |

---

## 1. Overview

The Settings module uses Zod schemas to validate incoming request data before it reaches the service layer.

Validation is performed through the existing validation middleware.

The validation flow is:

```text
Client Request
      ↓
Authentication Middleware
      ↓
Validation Middleware
      ↓
Zod Schema
      ↓
Controller
      ↓
Service
```

This prevents invalid or unexpected input from reaching the Settings business logic.

---

## 2. Validation Files

| Validation | Location |
|------------|----------|
| Settings Validation | `backend/src/validations/settings.validation.js` |
| Security Validation | `backend/src/validations/security.validation.js` |
| Account Validation | `backend/src/validations/account.validation.js` |

---

## 3. Settings Update Validation

Discovery settings are validated using:

```text
updateSettingsSchema
```

The schema accepts:

```text
discoveryPreferences
isDiscoverable
```

---

## 4. Discovery Preferences Validation

`discoveryPreferences` must be an array.

Each value must be one of the supported discovery purposes:

```text
friends
professional
learning
```

Example of valid input:

```json
{
    "discoveryPreferences": [
        "friends",
        "professional"
    ]
}
```

---

## 5. Minimum Preferences

At least one discovery preference is required when the field is provided.

```javascript
.min(1, "At least one discovery preference is required")
```

Therefore, the following is invalid:

```json
{
    "discoveryPreferences": []
}
```

The validation layer rejects the request before it reaches the service.

---

## 6. Maximum Preferences

A maximum of three discovery preferences is allowed.

```javascript
.max(3, "Maximum of 3 discovery preferences are allowed")
```

Since Nexora currently supports three discovery purposes, the maximum corresponds to all available options.

```text
friends
professional
learning
```

---

## 7. Optional Discovery Fields

Both Settings fields are optional.

```javascript
discoveryPreferences: ... .optional()

isDiscoverable: ... .optional()
```

This allows the API to update only the setting that was provided.

For example:

```json
{
    "isDiscoverable": false
}
```

is valid without sending `discoveryPreferences`.

---

## 8. Discoverability Validation

`isDiscoverable` must be a Boolean when provided.

The validation layer ensures that the API receives the expected data type.

---

## 9. Strict Object Validation

The Settings schema uses:

```javascript
.strict()
```

This prevents unexpected fields from being accepted by the validation schema.

This keeps the API input limited to the fields currently supported by the Settings module.

---

## 10. Password Change Validation

Password changes use:

```text
changePasswordSchema
```

The schema validates:

```text
currentPassword
newPassword
confirmPassword
```

---

## 11. Current Password Validation

The current password must be provided.

```javascript
currentPassword: z
    .string()
    .min(1, "Current password is required")
```

An empty current password is therefore rejected.

The validation layer only verifies that the value is present.

Actual password correctness is verified later by the Security service.

---

## 12. New Password Validation

The new password must contain at least eight characters.

```javascript
.min(8, "New password must be at least 8 characters")
```

It must also contain:

- At least one lowercase letter.
- At least one uppercase letter.
- At least one number.
- At least one supported special character.

The password validation is enforced through the regular expression defined in `changePasswordSchema`.

---

## 13. Confirm Password Validation

The confirmation password must be provided.

```javascript
confirmPassword: z
    .string()
    .min(1, "Please confirm your new password")
```

The schema also verifies that the confirmation matches the new password.

---

## 14. Password Validation vs Password Verification

These are separate responsibilities.

### Validation

The validation layer checks:

- Password exists.
- Minimum length.
- Required character types.
- Confirmation exists.
- New and confirmation passwords match.

### Verification

The Security service checks:

- Whether the current password is actually correct.
- Whether the new password is different from the current password.

```text
Request
  ↓
Validation
  ↓
Current password provided?
  ↓
New password valid?
  ↓
Passwords match?
  ↓
Security Service
  ↓
Verify current password
  ↓
Check new password is different
```

---

## 15. Account Deletion Validation

Account deletion uses:

```text
deleteAccountSchema
```

The schema currently validates:

```text
currentPassword
```

---

## 16. Delete Account Password Requirement

A current password is required before account deletion.

Example of valid input:

```json
{
    "currentPassword": "user-password"
}
```

An empty value is rejected.

The validation layer ensures that the password is present, while the account deletion service verifies whether the password is correct.

---

## 17. Account Deletion Confirmation

The frontend also requires the user to type:

```text
DELETE
```

before the deletion request can be submitted.

This confirmation is implemented in the Settings UI.

The current backend `deleteAccountSchema` does not receive or validate the `DELETE` confirmation value.

Therefore:

```text
Frontend
    ↓
Requires "DELETE"
    ↓
Current Password
    ↓
DELETE /settings/account
    ↓
Backend validates currentPassword
```

---

## 18. Validation Middleware

The Settings routes use the existing validation middleware.

The middleware performs validation before the controller is executed.

---

## 19. Validation Failure

When validation fails, the request does not proceed to the relevant controller or service logic.

The API returns a validation error response.

Example:

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        {
            "path": ["currentPassword"],
            "message": "Current password is required"
        }
    ]
}
```

The exact response structure is controlled by the application's validation middleware and error-handling implementation.

---

## 20. Validation Responsibilities

The validation layer is responsible for checking the structure and format of incoming data.

It does not perform database operations or authentication decisions.

```text
Validation
├── Data type
├── Required fields
├── Allowed values
├── Length requirements
├── Password format
└── Cross-field password matching
```

The service layer remains responsible for business rules such as:

```text
├── Current password verification
├── New password comparison
├── Updating the User document
└── Account deletion
```

---

## 21. Current Validation Scope

The current Settings implementation validates:

- Discovery preference values.
- Discovery preference minimum.
- Discovery preference maximum.
- Discoverability Boolean value.
- Current password presence.
- New password length.
- New password complexity.
- Confirm password presence.
- New password confirmation matching.
- Account deletion password presence.
- Unexpected Settings fields.

---

## 22. Design Decisions

### Why use Zod?

Zod provides explicit runtime validation for incoming API data and keeps the validation rules close to the API contract.

### Why use `.strict()`?

Strict validation prevents unsupported fields from becoming part of the Settings API contract.

### Why validate passwords before the service?

The service should receive structurally valid input. Password correctness remains a separate business rule handled by the service layer.

### Why validate confirmation separately?

The confirmation field provides an additional client-side and server-side consistency check before a password change is performed.

---

## 23. References

- [Zod Documentation](https://zod.dev/)
- [Express.js Documentation](https://expressjs.com/)

---

## 24. Revision History

| Version | Description |
|---------|-------------|
| 0.1 | Initial Settings Management Validation documentation |
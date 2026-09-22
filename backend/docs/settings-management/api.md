# Settings Management API

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | Settings Management |
| Document Type | API Documentation |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 22 September 2026 |

---

## 1. API Overview

The Settings Management API allows authenticated Nexora users to manage their personal application settings and account security.

The current implementation supports:

- Fetching discovery settings.
- Updating discovery preferences.
- Enabling or disabling profile discoverability.
- Changing the account password.
- Permanently deleting the account.

All Settings Management endpoints require authentication.

The authenticated user's identity is obtained from the existing JWT authentication middleware.

---

## 2. Base URL

The backend API uses:

Base path:
/api/v1

Therefore, the Settings Management endpoints are:

```text
GET    /api/v1/settings
PATCH  /api/v1/settings
PATCH  /api/v1/security/password
DELETE /api/v1/settings/account
```

---

## 3. Authentication

Settings APIs require an authenticated Nexora user.

Authentication is handled through the existing JWT authentication middleware.

The backend identifies the current user through:

```js
req.user._id
```

Unauthenticated requests are rejected by the authentication middleware before reaching the Settings controller.

---

## 4. GET Settings

**Endpoint**

```text
GET /api/v1/settings
```

**Purpose**

Retrieves the authenticated user's current discovery and privacy settings.

**Authentication**

Required.

**Request Body**

No request body is required.

**Successful Response**

HTTP Status: `200 OK`

Response structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Settings fetched successfully",
  "data": {
    "settings": {
      "discoveryPreferences": [
        "friends",
        "professional"
      ],
      "isDiscoverable": true
    }
  }
}
```

**Response Fields**

| Field | Type | Description |
|---|---|---|
| success | Boolean | Indicates whether the request succeeded |
| statusCode | Number | HTTP status code |
| message | String | Operation result message |
| data.settings | Object | Current user settings |
| discoveryPreferences | Array | Selected discovery purposes |
| isDiscoverable | Boolean | Controls whether the profile can appear in discovery |

**Possible Errors**

**User Not Found**

HTTP Status: `404 Not Found`

Message:

```text
User not found
```

This occurs if the authenticated user's database record cannot be found.

---

## 5. PATCH Settings

**Endpoint**

```text
PATCH /api/v1/settings
```

**Purpose**

Updates the authenticated user's discovery and privacy settings.

**Authentication**

Required.

**Request Body**

The endpoint accepts:

```json
{
  "discoveryPreferences": [
    "friends",
    "professional"
  ],
  "isDiscoverable": true
}
```

Both fields are optional.

At least one field should be supplied when performing a meaningful update.

**Supported Discovery Preferences**

The following values are supported:

```text
friends
professional
learning
```

Example:

```json
{
  "discoveryPreferences": [
    "professional",
    "learning"
  ]
}
```

**Privacy / Discoverability**

The `isDiscoverable` field controls whether the user's profile can appear in discovery.

```json
{
  "isDiscoverable": true
}
```

means the profile remains discoverable.

```json
{
  "isDiscoverable": false
}
```

means the profile is hidden from discovery.

The frontend presents this behavior as a privacy control.

**Successful Response**

HTTP Status: `200 OK`

Response structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Settings updated successfully",
  "data": {
    "settings": {
      "discoveryPreferences": [
        "professional",
        "learning"
      ],
      "isDiscoverable": true
    }
  }
}
```

**Update Behavior**

The service updates only the fields supplied in the request.

For example:

```json
{
  "isDiscoverable": false
}
```

updates discoverability without replacing the existing discovery preferences.

Similarly:

```json
{
  "discoveryPreferences": [
    "friends"
  ]
}
```

updates the discovery preferences without modifying discoverability.

**Possible Errors**

**User Not Found**

HTTP Status: `404 Not Found`

Message:

```text
User not found
```

**Invalid Discovery Preference**

The request is rejected when a discovery preference is outside:

```text
friends
professional
learning
```

**Empty Discovery Preferences**

The validation schema requires at least one discovery preference when the field is supplied.

**Too Many Preferences**

A maximum of three discovery preferences is allowed.

**Unknown Fields**

The validation schema is strict.

Unexpected fields are rejected.

---

## 6. PATCH Change Password

**Endpoint**

```text
PATCH /api/v1/security/password
```

**Purpose**

Changes the authenticated user's password.

Although the endpoint is implemented under the Security route, it is exposed through the Security section of the Settings interface.

**Authentication**

Required.

**Request Body**

```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Required Fields**

| Field | Type | Required |
|---|---|---|
| currentPassword | String | Yes |
| newPassword | String | Yes |
| confirmPassword | String | Yes |

**Password Requirements**

The new password must:

- Contain at least 8 characters.
- Contain at least one uppercase letter.
- Contain at least one lowercase letter.
- Contain at least one number.
- Contain at least one special character.

Supported special characters are defined by the validation expression in:

```text
src/validations/security.validation.js
```

**Password Confirmation**

The following values must match:

- `newPassword`
- `confirmPassword`

If they do not match, validation fails.

**Current Password Verification**

The service retrieves the authenticated user's password and compares the supplied current password against the stored password.

The password is never returned in the API response.

**Same Password Protection**

The new password cannot be identical to the current password.

The service explicitly checks this condition before updating the password.

**Successful Response**

HTTP Status: `200 OK`

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully"
}
```

**Possible Errors**

**User Not Found**

HTTP Status: `404 Not Found`

Message:

```text
User not found
```

**Incorrect Current Password**

HTTP Status: `401 Unauthorized`

Message:

```text
Current password is incorrect
```

**Same Password**

HTTP Status: `400 Bad Request`

Message:

```text
New password must be different from your current password
```

**Password Validation Failure**

Validation rejects passwords that do not satisfy the configured password requirements.

**Password Confirmation Failure**

Message:

```text
New passwords do not match
```

---

## 7. DELETE Account

**Endpoint**

```text
DELETE /api/v1/settings/account
```

**Purpose**

Permanently deletes the authenticated user's Nexora account and associated application data.

**Authentication**

Required.

**Request Body**

```json
{
  "currentPassword": "CurrentPassword123!"
}
```

**Required Field**

| Field | Type | Required |
|---|---|---|
| currentPassword | String | Yes |

**Password Verification**

The current password must be verified before account deletion is allowed.

This prevents an authenticated session alone from being sufficient to permanently delete an account.

**Related Data Removed**

The current implementation removes:

- Connection records involving the user.
- Messages belonging to the user's conversations.
- Conversations involving the user.
- Notifications belonging to the user.
- The User record itself.

**Cookie Cleanup**

After successful account deletion, the controller clears:

- `accessToken`
- `refreshToken`

**Successful Response**

HTTP Status: `200 OK`

Response:

```json
{
  "success": true,
  "message": "Account deleted successfully."
}
```

**Possible Errors**

**User Not Found**

HTTP Status: `404 Not Found`

Message:

```text
User not found.
```

**Incorrect Password**

HTTP Status: `401 Unauthorized`

Message:

```text
Current password is incorrect.
```

**Missing Password**

Validation rejects the request when `currentPassword` is not supplied.

---

## 8. Endpoint Summary

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/settings` | Fetch settings | Required |
| PATCH | `/settings` | Update settings | Required |
| PATCH | `/security/password` | Change password | Required |
| DELETE | `/settings/account` | Delete account | Required |

---

## 15. References

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Zod Documentation](https://zod.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [HTTP Semantics / RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)

---

## 16. Revision History

| Version | Description |
|---|---|
| 0.1 | Initial Settings Management API documentation |
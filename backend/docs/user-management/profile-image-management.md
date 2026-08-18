> This document describes the profile image management feature implemented by Nexora.
> It explains the image upload workflow, storage architecture, validation strategy, security considerations, and design decisions used to manage user profile images.

# Profile Image Management

## Document Information

| Property | Value |
|----------|-------|
| Project | Nexora |
| Module | User Management |
| Document Type | Feature Design |
| Document Version | 0.2 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 17 August 2026 |

---

## Component Structure

| Component | Location |
|----------|----------|
| User Routes | `src/routes/user.routes.js` |
| User Controller | `src/controllers/user.controller.js` |
| User Service | `src/services/user.service.js` |
| User Validation | `src/validations/user.validation.js` |
| Multer Configuration | `src/middleware/multer.middleware.js` |
| Image Storage Utility | `src/utils/cloudinary.js` |
| User Model | `src/models/user.model.js` |

---

# 1. Overview

The Profile Image Management feature allows authenticated users to upload and update their profile picture.

Rather than storing image files directly inside the database, Nexora stores profile images using Cloudinary and persists the required image metadata within the user document.

The stored metadata includes the Cloudinary image URL and file identifier. The file identifier allows Nexora to identify the stored asset when the image needs to be replaced or removed.

This approach improves scalability, performance, and maintainability while keeping binary image data outside MongoDB.

---

# 2. Objectives

The profile image management feature is designed to:

- Allow authenticated users to upload profile images.
- Store image files securely outside the database.
- Maintain only image references within MongoDB.
- Validate uploaded files before storage.
- Support efficient image delivery through a Content Delivery Network (CDN).

---

# 3. Supported Operations

The implemented feature supports the following operations.

| Operation | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Upload Profile Image | PATCH | `/api/v1/users/profile/image` | Upload or replace the authenticated user's profile image |
| Remove Profile Image | DELETE | `/api/v1/users/profile/image` | Remove the authenticated user's profile image |

---

# 4. Upload Workflow

The profile image upload follows the workflow below.

```text
Authenticated User

↓

Select Image

↓

Upload Request

↓

Multer Validation

↓

Cloudinary Upload

↓

Receive Cloudinary URL + File ID

↓

Update User Profile

↓

Return Updated Profile
```
Multer handles the incoming multipart file and validates the upload before the image is sent to Cloudinary.

After a successful Cloudinary upload, Nexora stores the returned image URL and file identifier in the user's profilePic field.

---

# 5. Image Storage Strategy

Nexora stores profile images using Cloudinary.

The uploaded image is stored in Cloudinary under the Nexora profile-image storage path.

MongoDB stores only the metadata required to reference the image:

```json
{
    "profilePic": {
        "url": "https://res.cloudinary.com/...",
        "fileId": "nexora/profile-images/..."
    }
}
```

The database never stores binary image data.

The url is used to retrieve the image, while the fileId is used to identify the Cloudinary asset when the image needs to be replaced or deleted.

---

# 6. Why External Storage?

Storing images directly inside MongoDB would unnecessarily increase database size and reduce performance.

Using dedicated object storage provides several advantages:

- Smaller database documents.
- Faster database queries.
- Independent image storage.
- Better scalability.
- Simplified backups.
- CDN-based image delivery.

---

# 7. Why Cloudinary?

Cloudinary was selected because it provides:

- Cloud-based image storage.
- CDN-based image delivery.
- Image optimization and transformation capabilities.
- Secure API-based asset management.
- Node.js integration.
- Asset deletion through the Cloudinary API.
- A suitable free tier for development and educational projects.

The storage layer is isolated from the rest of the application so that the provider can be replaced in the future if required.

---

# 8. File Validation

Every uploaded image is validated before storage.

Validation includes:

- Supported file type.
- Maximum file size.
- Valid image MIME type.
- Presence of uploaded file.

Invalid uploads are rejected before reaching the storage provider.

---

# 9. Image Replacement

Uploading a new profile image replaces the authenticated user's existing profile image.

When an existing profile image is present, Nexora uses the stored Cloudinary `fileId` to identify the previous asset.

The previous Cloudinary asset is removed before or as part of the replacement workflow, preventing obsolete profile images from accumulating in cloud storage.

After the new image is uploaded successfully, MongoDB is updated with the new:

- Cloudinary image URL.
- Cloudinary file identifier.

Only one active profile image is associated with each user.

---

# 10. Image Deletion

Authenticated users can remove their current profile image using:

```http
DELETE /api/v1/users/profile/image

The deletion workflow is:

Authenticated User

↓

Delete Profile Image Request

↓

Find User

↓

Check Existing Cloudinary File ID

↓

Delete Cloudinary Asset

↓

Clear profilePic.url

↓

Clear profilePic.fileId

↓

Return Updated User
```

After successful deletion, the user's profile contains:

```json
{
    "profilePic": {
        "url": null,
        "fileId": null
    }
}
```

If the user does not currently have a profile image, the operation is handled without attempting to delete a nonexistent Cloudinary asset.

---

# 11. Security Considerations

The profile image implementation follows these security principles.

- Authentication is required for profile image operations.
- Uploaded files are validated before storage.
- Arbitrary file types are rejected.
- Images are stored outside the application server.
- Binary image data is never stored in MongoDB.
- Cloudinary credentials remain server-side and are never exposed to clients.
- Cloudinary file identifiers are stored for controlled asset management.
- Uploaded filenames are not trusted directly.
- Only the authenticated user can modify or remove their own profile image.
- Image upload and deletion logic remains isolated within the service layer.

---

# 12. Assumptions

The current implementation assumes:

- Users are authenticated before uploading or removing images.
- One profile image exists per user.
- Profile images are delivered through Cloudinary URLs.
- Cloudinary credentials remain confidential.
- MongoDB stores Cloudinary image metadata rather than binary image data.

---

# 13. Known Limitations

The current implementation intentionally accepts the following limitations.

- Image cropping is not supported.
- Multiple profile images are not supported.
- Image compression settings are not configurable by users.
- Upload progress tracking is not implemented.
- Advanced image moderation is not implemented.

---

# 14. Future Improvements

The profile image feature may be extended with:

- Image cropping.
- Image resizing and transformation presets.
- Multiple profile pictures.
- Cover images.
- Image moderation.
- Advanced upload validation.
- Upload progress tracking.
- Additional storage-provider adapters if required.

---

# 15. Out of Scope

This document intentionally does not cover:

- User authentication.
- JWT authentication.
- Profile information updates.
- Location management.
- Authorization.
- General file management.

These topics are documented separately within the User Management module.

---

# 15. Design Decisions

## Why store images outside MongoDB?

Object storage services are specifically designed for storing files efficiently.

Keeping images outside the database reduces storage overhead and improves application scalability.

---

## Why store only image URLs?

Image URLs are lightweight references that allow applications to retrieve images without storing large binary objects inside user documents.

---

## Why choose Cloudinary?

Cloudinary provides cloud image storage, CDN delivery, image transformation capabilities, and API-based asset management.

It also provides the functionality required by Nexora to upload, replace, and delete profile images while keeping binary files outside MongoDB.

The storage integration is isolated within the backend so that the provider can be changed without significantly affecting the rest of the User Management module.

---

## Why validate uploads before storage?

Early validation prevents invalid files from reaching the storage provider, reducing unnecessary processing and improving application security.

---

# 16. References

- Cloudinary Documentation
- Multer Documentation
- MongoDB Documentation
- Mongoose Documentation
- Express.js Documentation
- OWASP File Upload Cheat Sheet

---

# 17. Revision History

| Version | Description |
|----------|-------------|
| 0.1 | Initial Profile Image Management Design |
| 0.2 | Updated documentation to reflect the completed Cloudinary integration, profile image replacement, image deletion, Cloudinary file identifiers, and current upload security behavior |
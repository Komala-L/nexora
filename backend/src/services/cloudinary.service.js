import cloudinary from "../utils/cloudinary.js";

export const uploadImage = (
    buffer,
    folder = "nexora/profile-images"
) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    fileId: result.public_id,
                });
            }
        );

        uploadStream.end(buffer);
    });
};

export const uploadChatAttachment = (
    buffer,
    {
        mimeType,
        fileName,
        folder = "nexora/chat-attachments",
    } = {}
) => {
    return new Promise((resolve, reject) => {
        const isImage =
            mimeType?.startsWith("image/");

        const safeFileName = fileName
            ? fileName.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            )
            : `attachment-${Date.now()}`;

        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: isImage
                        ? "image"
                        : "raw",

                    public_id: isImage
                        ? undefined
                        : safeFileName,
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        resourceType:
                            result.resource_type,
                        fileName:
                            fileName ||
                            safeFileName,
                        mimeType,
                    });
                }
            );

        uploadStream.end(buffer);
    });
};

export const uploadReportEvidence = (
    buffer,
    {
        folder = "nexora/report-evidence",
    } = {}
) => {
    return new Promise((resolve, reject) => {
        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "image",
                    type: "authenticated",
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve({
                        publicId: result.public_id,
                        resourceType: result.resource_type,
                        format: result.format,
                        bytes: result.bytes,
                        width: result.width,
                        height: result.height,
                    });
                }
            );

        uploadStream.end(buffer);
    });
};

export const deleteReportEvidence = async (publicId) => {
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        type: "authenticated",
    });

    if (
        result.result !== "ok" &&
        result.result !== "not found"
    ) {
        throw new Error(
            `Failed to delete authenticated evidence: ${result.result}`
        );
    }

    return result;
};

export const getReportEvidenceUrl = async (publicId) => {
    if (
        typeof publicId !== "string" ||
        !publicId.startsWith("nexora/report-evidence/")
    ) {
        throw new Error("Invalid report evidence identifier.");
    }

    const result = await cloudinary.api.resource(publicId, {
        resource_type: "image",
        type: "authenticated",
    });

    if (!result?.public_id) {
        throw new Error("Report evidence was not found.");
    }

    return cloudinary.url(result.public_id, {
        resource_type: "image",
        type: "authenticated",
        secure: true,
        sign_url: true,
        format: result.format,
    });
};

export const deleteImage = async (fileId) => {
    const result = await cloudinary.uploader.destroy(fileId, {
        resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error(
            `Failed to delete Cloudinary image: ${result.result}`
        );
    }

    return result;
};
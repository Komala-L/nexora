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
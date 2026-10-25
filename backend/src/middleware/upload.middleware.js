import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPEG, PNG, and WebP images are allowed."
            )
        );
    }
};

const createUpload = (maxFiles) =>
    multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB per file
            files: maxFiles,
        },
    });

const upload = createUpload(1);

export const reportEvidenceUpload = createUpload(3);
export default upload;
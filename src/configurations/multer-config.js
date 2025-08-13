import multer from 'multer';
import BadRequestException from "../exception/bad-request-exception.js";

const MAX_UPLOAD = process.env.MAX_UPLOADFILE_SIZE || 10;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Type file tidak valid, hanya PDF yang diperbolehkan'), false);
        }
    }
});

export default upload;

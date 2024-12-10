import multer from 'multer';
import BadRequestException from "../exception/bad-request-exception.js";

const MAX_UPLOAD = process.env.MAX_UPLOADFILE_SIZE || 10;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/x-excel',
            'application/x-msexcel',
            'application/csv',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Invalid file type, only Excel files are allowed!'), false);
        }
    }
});

export default upload;

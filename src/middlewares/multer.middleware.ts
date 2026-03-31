import multer, { Multer, StorageEngine } from 'multer';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const storage: StorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                '-' +
                uniqueSuffix +
                '.' +
                file.mimetype.split('/')[1]
        );
    },
});

export const upload: Multer = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'videoFile') {
            if (!file.mimetype.startsWith('video/')) {
                return cb(new Error('Only video allowed'));
            }
        }

        if (file.fieldname === 'thumbnail') {
            const allowed = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowed.includes(file.mimetype)) {
                return cb(new Error('Invalid image type'));
            }
        }

        cb(null, true);
    },
});

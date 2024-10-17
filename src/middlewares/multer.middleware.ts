import multer, { Multer, StorageEngine } from 'multer';

const storage: StorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/temp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + file.mimetype);
    },
});

export const upload: Multer = multer({ storage });

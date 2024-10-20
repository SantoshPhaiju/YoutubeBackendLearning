import multer, { Multer, StorageEngine } from 'multer';

const storage: StorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        console.log('file', file);
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

export const upload: Multer = multer({ storage });

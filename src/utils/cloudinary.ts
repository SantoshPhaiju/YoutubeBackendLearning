import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { appConfig } from '../config/config';

cloudinary.config({
    cloud_name: 'dozo84nle',
    api_key: appConfig.cloudinaryApiKey,
    api_secret: appConfig.cloudinaryApiSecret,
});


import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import { appConfig } from '../config/config';

cloudinary.config({
    cloud_name: appConfig.cloudinaryCloudName,
    api_key: appConfig.cloudinaryApiKey,
    api_secret: appConfig.cloudinaryApiSecret,
});

export const uploadOnCloudinary = async (
    localFilepath: string
): Promise<string | null> => {
    try {
        if (!localFilepath) return null;

        // Upload file on Cloudinary
        const response: UploadApiResponse = await cloudinary.uploader.upload(
            localFilepath,
            {
                resource_type: 'auto',
            }
            // ! This is a callback function, it can either be used or cannot be used
            // (error, result) => {
            //     if (error) {
            //         console.log(error);
            //         return null;
            //     }

            //     console.log(result);

            //     return result;
            // }
        );

        // file has been uploaded successfully
        console.log('File uploaded successfully on cloudinary', response.url);
        return response.url;
    } catch (error) {
        fs.unlinkSync(localFilepath); // remove the file from the server if it fails to upload on cloudinary
        console.log(error);
        return null;
    }
};

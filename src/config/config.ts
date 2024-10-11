export const appConfig: {
    port: string | undefined;
    mongodbURI: string | undefined;
} = {
    port: process.env.PORT,
    mongodbURI: process.env.MONGODB_URI,
};

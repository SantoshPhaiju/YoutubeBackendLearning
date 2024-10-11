export const appConfig: {
    port: string | undefined;
    corsOrigin: string | undefined;
} = {
    port: process.env.PORT,
    corsOrigin: process.env.NODE_ENV === 'development' ? process.env.CORS_ORIGIN: process.env.PRODUCTION_CORS_ORIGIN,
};

export const appConfig: {
    port: string | undefined;
    corsOrigin: string | undefined;
    accessTokenSecret: string | undefined;
    accessTokenExpiry: string | undefined;
    refreshTokenSecret: string | undefined;
    refreshTokenExpiry: string | undefined;
} = {
    port: process.env.PORT,
    corsOrigin: process.env.NODE_ENV === 'development' ? process.env.CORS_ORIGIN: process.env.PRODUCTION_CORS_ORIGIN,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
};

import dotenv from 'dotenv';

dotenv.config({
    path: './.env',
});

import app from './app';
import { appConfig } from './config/config';
import connectToDb from './db/db';

const port = appConfig.port || 8080;

connectToDb()
    .then(() => {
        app.on('error', (err) => {
            console.error('Error starting server: ', err);
            throw err;
        });
        app.listen(port, () => {
            console.log(`[server]: 🎯 Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error loading .env file: ', error);
        process.exit(1);
    });

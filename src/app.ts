import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { appConfig } from './config/config';

const app: Express = express();

const { corsOrigin } = appConfig;

app.use(cors({
    origin: corsOrigin,
    credentials: true,
}));

app.use(express.json());

export default app;

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import { appConfig } from './config/config';

const app: Express = express();

const { corsOrigin } = appConfig;

app.use(
    cors({
        origin: corsOrigin,
        credentials: true,
    })
);
app.use(
    express.json({
        limit: '1mb',
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: '1mb',
    })
);
app.use(express.static('public'));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).send('Hello World');
});

// routes import
import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware';
import userRouter from './routes/user.routes';

// routes declaration
app.use('/api/v1/users', userRouter);

app.use(errorHandlerMiddleware);

export default app;

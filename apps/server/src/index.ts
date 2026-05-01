import { env } from '@opsflow/env/server';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { errorHandler } from './lib/errorHandler';
import apiRouter from './routers';
import { StatusCodes } from './utils/statusCodes';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(StatusCodes.OK.code).send('OK');
});

app.use('/api', apiRouter);
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

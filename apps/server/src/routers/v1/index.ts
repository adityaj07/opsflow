import { Router } from 'express';
import authRouter from './auth/index.js';
import dashboardRouter from './dashboard/index.js';
import tasksRouter from './tasks/index.js';
import usersRouter from './users/index.js';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/tasks', tasksRouter);
v1Router.use('/users', usersRouter);

export default v1Router;

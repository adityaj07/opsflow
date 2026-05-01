import { Router } from 'express';
import authRouter from './auth';
import dashboardRouter from './dashboard';
import tasksRouter from './tasks';
import usersRouter from './users';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/tasks', tasksRouter);
v1Router.use('/users', usersRouter);

export default v1Router;

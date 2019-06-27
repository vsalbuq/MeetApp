import { Router } from 'express';
import UserController from './app/controllers/UserController';

const routes = new Router();

// TODO: Create user
routes.post('/users', UserController.store);
// TODO: Authenticate user
// TODO: Update user

export default routes;

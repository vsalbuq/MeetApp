import { Router } from 'express';

const routes = new Router();

// TODO: Create user
routes.post('/users', (req, res) => {
  return res.json({ message: 'mah oe' });
});
// TODO: Authenticate user
// TODO: Update user

export default routes;

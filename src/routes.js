import Router from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import DetailsMeetupController from './app/controllers/DetailsMeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizingController from './app/controllers/OrganizingController';
import authMiddleware from './app/middlewares/auth';

import validateMeetupStore from './app/validators/MeetupStore';
import validateMeetupUpdate from './app/validators/MeetupUpdate';
import validateSessionStore from './app/validators/SessionStore';
import validateSubscriptionStore from './app/validators/SubscriptionStore';
import validateUserStore from './app/validators/UserStore';
import validateUserUpdate from './app/validators/UserUpdate';

const routes = new Router();
const upload = multer(multerConfig);
/** Prevent brute force attack with redis */

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const bruteForce = new Brute(bruteStore);

routes.post(
  '/sessions',
  validateSessionStore,
  bruteForce.prevent,
  SessionController.store
);
routes.post('/users', validateUserStore, UserController.store);
// global middleware
routes.use(authMiddleware);
routes.post('/files', upload.single('file'), FileController.store);

routes.put('/users', validateUserUpdate, UserController.update);
routes.get('/meetups', MeetupController.index);
routes.get('/details-meetup/:id', DetailsMeetupController.index);
routes.post('/meetups/', validateMeetupStore, MeetupController.store);
routes.put('/meetups/:id', validateMeetupUpdate, MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);
routes.get('/subscriptions', SubscriptionController.index);
routes.post(
  '/subscriptions/:id',
  validateSubscriptionStore,
  SubscriptionController.store
);
routes.get('/organizing', OrganizingController.index);
export default routes;

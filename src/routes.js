import Router from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizingController from './app/controllers/OrganizingController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);
routes.post('/sessions', SessionController.store);

// global middleware
routes.use(authMiddleware);
routes.post('/files', upload.single('file'), FileController.store);
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);
routes.get('/meetups', MeetupController.index);
routes.post('/meetups/:id', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);
routes.get('/subscriptions', SubscriptionController.index);
routes.post('/subscriptions/:id', SubscriptionController.store);
routes.get('/organizing', OrganizingController.index);
export default routes;

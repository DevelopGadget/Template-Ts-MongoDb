import { Router } from 'express';
import UserController from '../controllers/user.controller';
import UserMiddleware from '../middlewares/user.middlewares';

class User {
  constructor(private ROUTER: Router) {
    this.ConfigRouter();
  }

  private ConfigRouter() {
    this.ROUTER.get('/user', UserMiddleware.IsValidToken, UserController.GetId);
    this.ROUTER.put('/user', UserMiddleware.IsValidToken, UserMiddleware.IsValidUpdate, UserController.Put);
    this.ROUTER.put('/user/cutOff', UserMiddleware.IsValidToken, UserMiddleware.IsValidUpdateCutOff, UserController.Put);
    this.ROUTER.delete('/user', UserMiddleware.IsValidToken, UserController.Delete);
  }
}

export default User;

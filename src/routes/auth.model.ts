import { Router } from 'express';
import JwtAuthController from '../controllers/jwt_auth.controller';
import UserMiddleware from '../middlewares/user.middlewares';

class Auth {
  constructor(private ROUTER: Router) {
    this.ConfigRouter();
  }

  private ConfigRouter() {
    this.ROUTER.get('/auth/refresh', UserMiddleware.IsValidRefresh, JwtAuthController.RefreshToken);
    this.ROUTER.post('/auth/signup', UserMiddleware.IsValidUser, UserMiddleware.IsValidEmail, JwtAuthController.Post);
    this.ROUTER.post('/auth/login', UserMiddleware.IsValidLogin, JwtAuthController.PostLogin);
    this.ROUTER.put('/auth/email', UserMiddleware.IsValidCode, JwtAuthController.PutEmailValidationCode);
    this.ROUTER.put('/auth/recovery', JwtAuthController.PutPasswordRecovery);
    this.ROUTER.put('/auth/email/resend', UserMiddleware.IsValidResend, JwtAuthController.PutReSendCode);
  }
}

export default Auth;

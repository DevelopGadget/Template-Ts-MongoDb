import { Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth.controller';
import { validate, EmailDomainValidatorResponse } from 'email-domain-validator';
import CryptoJS from 'crypto-js';
import { LOGIN, USER_OBJECT, VALIDATION_CODE, VALIDATION_RESEND } from '../models/user.model';
import { MessageCodes } from '../config/codes.config';
import Moment from 'moment';

class User {
  private static instance: User;

  public static getInstance(): User {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

  public async IsValidUser(req: Request, res: Response, next: NextFunction) {
    try {
      await USER_OBJECT.validateAsync(req.body);
      req.body.Password = CryptoJS.AES.encrypt(req.body.Password, process.env.ENCRYPT).toString();
      req.headers.Code = await AuthController.CreateCode();
      req.body.EmailValidationCode = CryptoJS.AES.encrypt((req.headers.Code ?? req.headers.code) as string, process.env.ENCRYPT).toString();
      req.body.FirstName = req.body.FirstName.toString().trim();
      req.body.LastName = req.body.LastName.toString().trim();
    } catch (error) {
      return res.status(406).json({ StatusCode: 406, Message: error.toString(), CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    }
    next();
  }

  public async IsValidUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      req.body.IsUpdate = true;
      req.body = await USER_OBJECT.validateAsync(req.body);
    } catch (error) {
      return res.status(406).json({ StatusCode: 406, Message: error.toString(), CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    }
    next();
  }

  public async IsValidUpdateCutOff(req: Request, res: Response, next: NextFunction) {
    try {
      req.body.IsUpdate = true;
      req.body.LastCutOffDate = Moment.utc().toDate();
      req.body = await USER_OBJECT.validateAsync(req.body);
    } catch (error) {
      return res.status(406).json({ StatusCode: 406, Message: error.toString(), CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    }
    next();
  }

  public async IsValidLogin(req: Request, res: Response, next: NextFunction) {
    try {
      await LOGIN.validateAsync(req.body);
    } catch (error) {
      return res.status(406).json({ StatusCode: 406, Message: error.toString(), CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    }
    next();
  }

  public async IsValidCode(req: Request, res: Response, next: NextFunction) {
    try {
      await VALIDATION_CODE.validateAsync(req.body);
    } catch (error) {
      return res.status(406).json({ StatusCode: 406, Message: error.toString(), CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    }
    next();
  }

  public async IsValidResend(req: Request, res: Response, next: NextFunction) {
    try {
      await VALIDATION_RESEND.validateAsync(req.body);
      req.headers.code = await AuthController.CreateCode();
      req.body.EmailValidationCode = CryptoJS.AES.encrypt((req.headers.Code ?? req.headers.code) as string, process.env.ENCRYPT).toString();
    } catch (error) {
      return res.status(406).json({ StatusCode: 406, Message: error.toString(), CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    }
    next();
  }

  public async IsValidToken(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization)
      return res.status(401).json({ StatusCode: 406, Message: 'INVALID_TOKEN', CodeError: MessageCodes.INVALID_TOKEN, IsError: true });

    try {
      const token = req.headers.authorization.split(' ')[1];
      const response = AuthController.DecodeToken(token);
      if (!response.IsError) {
        req.headers.Id = response.Message.sub;
        req.headers.EmailAddress = response.Message.EmailAddress;
        next();
      } else {
        return res.status(response.StatusCode).json(response);
      }
    } catch (error) {
      return res.status(400).json({ StatusCode: 400, Message: 'ERROR_IN_REQUEST', CodeError: MessageCodes.ERROR_IN_REQUEST, IsError: true });
    }
  }

  public IsValidRefresh(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization)
      return res.status(401).json({ StatusCode: 406, Message: 'INVALID_TOKEN', CodeError: MessageCodes.INVALID_TOKEN, IsError: true });

    try {
      const token = req.headers.authorization.split(' ')[1];
      const response = AuthController.DecodeToken(token);
      if (response.IsError && response.CodeError === MessageCodes.EXPIRE_TOKEN) {
        req.headers.id = response.Message.sub;
        req.headers.emailaddress = response.Message.EmailAddress;
        next();
      } else {
        return res.status(response.StatusCode).json(response);
      }
    } catch (error) {
      return res.status(400).json({ StatusCode: 400, Message: 'ERROR_IN_REQUEST', CodeError: MessageCodes.ERROR_IN_REQUEST, IsError: true });
    }
  }

  public async IsValidEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const email = await validate(req.body.EmailAddress);
      if (!(email as EmailDomainValidatorResponse).isValidDomain)
        return res.status(406).json({ StatusCode: 406, Message: 'INVALID_EMAIL', CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    } catch (error) {
      return res.status(406).json({ StatusCode: 406, Message: 'INVALID_EMAIL', CodeError: MessageCodes.OBJECT_DATA_NOT_VALID, IsError: true });
    }
    next();
  }
}

export default User.getInstance();

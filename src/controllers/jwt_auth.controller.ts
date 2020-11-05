import { Response, Request } from 'express';
import ResponseData from '../models/response_data.model';
import UserMongoose from '../models/user.model';
import Mongoose from 'mongoose';
import { MessageCodes } from '../config/codes.config';
import Config from '../config/app.config';
import CryptoJS from 'crypto-js';
import AuthController from './auth.controller';
import Moment from 'moment';
import { MessagesEmail } from '../config/messages_email.config';
import RandExp from 'randexp';
import UserCore from '../core/user.core';

class JwtAuth {
  private static instance: JwtAuth;

  public static getInstance(): JwtAuth {
    if (!JwtAuth.instance) {
      JwtAuth.instance = new JwtAuth();
    }
    return JwtAuth.instance;
  }

  async Post(req: Request, res: Response): Promise<Response<ResponseData>> {
    try {
      const request = await UserCore.save({ req, callback: (val) => val && val.CodeError === MessageCodes.NOT_VERIFIED_EMAIL });
      if (req.headers.Code || req.headers.code)
        await AuthController.SendEmail(
          request.Message.EmailAddress, (req.headers.Code ?? req.headers.code) as string,
          MessagesEmail.Subject,
          MessagesEmail.Message
        );
      return res.status(200).send(request);
    } catch (error) {
      if (error.Message.name === 'MongoError' && error.Message.code === 11000)
        return res.status(409).send({ IsError: true, StatusCode: 409, Message: error.Message, CodeError: MessageCodes.EMAIL_DUPLICATE });
      return res.status(error?.StatusCode).send(error);
    }
  }

  async PostLogin(req: Request, res: Response): Promise<Response<ResponseData>> {
    const session = await Mongoose.startSession();
    session.startTransaction();
    try {
      req.headers.EmailAddress = req.body.EmailAddress;
      const request = await UserCore.findOneAndUpdate({
        req, query: { LastLogin: Moment.utc().toDate() },
        opt: { new: true, session }, optionalParamaters: '-EmailValidationCode',
        callback: (validation: ResponseData) => !validation
      });
      const password = CryptoJS.AES.decrypt(request.Message.Password, process.env.ENCRYPT).toString(CryptoJS.enc.Utf8);
      if (request && password !== req.body.Password) {
        await session.abortTransaction();
        return res.status(401).send({ IsError: true, StatusCode: 401, Message: 'Passowrd invalid', CodeError: MessageCodes.INVALID_PASSWORD });
      }
      const TOKEN = AuthController.CreateToken(request.Message._id, request.Message.EmailAddress);
      await session.commitTransaction();
      return res.status(200).send({
        IsError: false, StatusCode: 200,
        Message: { Token: Buffer.from(TOKEN).toString('base64'), User: request.Message }, CodeError: null,
      });
    } catch (error) {
      await session.abortTransaction();
      return res.status(error?.StatusCode).send(error);
    }
  }

  async PutEmailValidationCode(req: Request, res: Response): Promise<Response<ResponseData>> {
    const session = await Mongoose.startSession();
    session.startTransaction();
    try {
      req.headers = Object.assign(req.headers, req.body);
      const request = await UserCore.findByIdAndUpdate({
        req, query: { EmailIsValidated: true, EmailValidationCode: '' }, optionalParamaters: '-Password',
        callback: (validation: ResponseData) => validation && validation.CodeError === MessageCodes.NOT_VERIFIED_EMAIL
      });
      const code = CryptoJS.AES.decrypt(request.Message.EmailValidationCode, process.env.ENCRYPT).toString(CryptoJS.enc.Utf8);
      if (code === req.body.EmailValidationCode) {
        await session.commitTransaction();
        const TOKEN = AuthController.CreateToken(request.Message._id, request.Message.EmailAddress);
        request.Message = { Token: Buffer.from(TOKEN).toString('base64'), User: request.Message };
        return res.status(request.StatusCode).send(request);
      } else {
        await session.abortTransaction();
        return res.status(409).send({ IsError: true, StatusCode: 409, CodeError: MessageCodes.INVALID_CODE, Message: 'INVALID_CODE' });
      }
    } catch (error) {
      await session.abortTransaction();
      return res.status(error?.StatusCode).send(error);
    }
  }

  async PutReSendCode(req: Request, res: Response): Promise<Response<ResponseData>> {
    const session = await Mongoose.startSession();
    session.startTransaction();
    try {
      req.headers = Object.assign(req.headers, req.body);
      const request = await UserCore.findByIdAndUpdate({
        req, query: { EmailIsValidated: true, EmailValidationCode: '' }, optionalParamaters: '-Password',
        callback: (validation: ResponseData) => validation && validation.CodeError === MessageCodes.NOT_VERIFIED_EMAIL,
        opt: { new: true, session }
      });
      await AuthController.SendEmail(request.Message.EmailAddress, req.headers.code as string, MessagesEmail.Subject, MessagesEmail.Message);
      await session.commitTransaction();
      return res.status(request.StatusCode).send(request);
    } catch (error) {
      await session.abortTransaction();
      return res.status(error?.StatusCode).send(error);
    }
  }

  async PutPasswordRecovery(req: Request, res: Response): Promise<Response<ResponseData>> {
    try {
      req.headers = Object.assign(req.headers, req.body);
      const newPassword = new RandExp(Config.PASSWORD_REG_RECOVERY).gen();
      const newPasswordCrypto = CryptoJS.AES.encrypt(newPassword, process.env.ENCRYPT).toString();
      const request = await UserCore.findByIdAndUpdate({
        req, query: { Password: newPasswordCrypto }, subReq: {},
        callback: (validation: ResponseData) => !validation
      });
      await AuthController.SendEmail(request.Message.EmailAddress, newPassword, MessagesEmail.SubjectRecovery, MessagesEmail.MessageRecovery);
      request.Message = newPassword;
      return res.status(request.StatusCode).send(request);
    } catch (error) {
      return res.status(error?.StatusCode).send(error);
    }
  }

  async RefreshToken(req: Request, res: Response): Promise<Response<ResponseData>> {
    try {
      const TOKEN = AuthController.CreateToken(req.headers.id as string, req.headers.emailaddress as string);
      await UserCore.findByIdAndUpdate({ req, query: { LastLogin: Moment.utc().toDate() }, callback: (validation: ResponseData) => !validation });
      return res.status(200).send({ IsError: false, StatusCode: 200, Message: Buffer.from(TOKEN).toString('base64'), CodeError: null });
    } catch (error) {
      return res.status(400).send({ IsError: true, StatusCode: 400, Message: error, CodeError: MessageCodes.ERROR_IN_REQUEST });
    }
  }
}

export default JwtAuth.getInstance();

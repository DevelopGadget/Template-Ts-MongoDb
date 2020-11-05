import { resolve } from 'path';
import Fs from 'fs';
import SendGridConfig from '../models/send_grid_config.model';
import Moongose from 'mongoose';
import Admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import ResponseData from '../models/response_data.model';
import { User as UserDocument } from '../models/user.model';
import { MessageCodes } from './codes.config';

class App {
  private static instance: App;
  PRIVATE_KEY: string = Fs.readFileSync(
    resolve(__dirname, '../private.key'),
    'utf8'
  );
  PUBLIC_KEY: string = Fs.readFileSync(
    resolve(__dirname, '../public.key'),
    'utf8'
  );
  PASSWORD_REG: RegExp = new RegExp(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/
  );
  PASSWORD_REG_RECOVERY: RegExp = new RegExp(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,8}$/
  );

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  public getBucket(): Bucket {
    return Admin.storage().bucket();
  }

  public getEmailConfig(): SendGridConfig {
    return {
      Email: process.env.EMAIL,
      Key: process.env.SENDGRID_API_KEY,
      TemplateId: process.env.TEMPLATE,
    };
  }

  public async InitDatabase() {
    try {
      this.InitStorage();
      await Moongose.connect(process.env.MONGO, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      });
    } catch (e) {
      process.exit(1);
    }
  }

  public async InitStorage() {
    const cert = await import(resolve(__dirname, '../../SDK.json'));
    Admin.initializeApp({ credential: Admin.credential.cert(cert), storageBucket: process.env.FIREBASE });
  }

  ValidationError(data: UserDocument): ResponseData {
    if (!data)
      return { IsError: true, StatusCode: 404, Message: data, CodeError: MessageCodes.USER_NOT_FOUND };
    if (!data.IsActive)
      return { StatusCode: 409, Message: null, CodeError: MessageCodes.INACTIVE_USER, IsError: true };
    if (!data.EmailIsValidated)
      return {
        StatusCode: 409,
        Message: { _id: data._id, EmailAddress: data.EmailAddress, EmailIsValidated: false },
        IsError: true, CodeError: MessageCodes.NOT_VERIFIED_EMAIL
      };
  }
}

export default App.getInstance();

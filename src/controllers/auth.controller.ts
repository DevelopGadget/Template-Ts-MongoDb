import Crypto from 'crypto';
import Config from '../config/app.config';
import JWT from 'jsonwebtoken';
import ResponseData from '../models/response_data.model';
import SgEmail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import { MessageCodes } from '../config/codes.config';

class Auth {
  private static instance: Auth;

  public static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    SgEmail.setApiKey(Config.getEmailConfig().Key);
    return Auth.instance;
  }

  public async CreateCode(): Promise<any> {
    try {
      const buf = Crypto.randomBytes(4);
      return buf.toString('hex');
    } catch (error) {
      return undefined;
    }
  }

  public async SendEmail(TO: string, CODE: string, SUBJECT: string, MESSAGE: string): Promise<any> {
    try {
      const data: MailDataRequired = {
        to: TO,
        from: Config.getEmailConfig().Email,
        templateId: Config.getEmailConfig().TemplateId,
        subject: SUBJECT,
        dynamicTemplateData: {
          username: TO.split('@')[0],
          code: CODE,
          message: MESSAGE,
          subject: SUBJECT,
        },
      };
      return await SgEmail.send(data);
    } catch (error) {
      return error;
    }
  }

  public CreateToken(ID: string, EMAIL: string): string {
    return JWT.sign({ sub: ID, EmailAddress: EMAIL }, Config.PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '1d' });
  }

  public DecodeToken(TOKEN: string): ResponseData {
    try {
      const payload = JWT.verify(TOKEN, Config.PUBLIC_KEY, { algorithms: ['RS256'] });
      return { CodeError: null, Message: payload, IsError: false, StatusCode: 200 };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const payload = JWT.verify(TOKEN, Config.PUBLIC_KEY, {
          ignoreExpiration: true,
        });
        return { CodeError: MessageCodes.EXPIRE_TOKEN, Message: payload, IsError: true, StatusCode: 401 };
      }
      return { CodeError: MessageCodes.INVALID_TOKEN, Message: error, IsError: true, StatusCode: 401 };
    }
  }
}

export default Auth.getInstance();

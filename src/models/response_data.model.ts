import { MessageCodes } from '../config/codes.config';

interface ResponseData {
  Message: any;
  IsError: boolean;
  StatusCode: number;
  CodeError: MessageCodes;
}

export default ResponseData;

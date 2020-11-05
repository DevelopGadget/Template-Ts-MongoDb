import { Response, Request } from 'express';
import ResponseData from '../models/response_data.model';
import Mongoose from 'mongoose';
import { MessageCodes } from '../config/codes.config';
import UserCore from '../core/user.core';

class User {
  private static instance: User;

  public static getInstance(): User {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

  async GetId(req: Request, res: Response): Promise<Response<ResponseData>> {
    try {
      const request = await UserCore.findById({ req, callback: (val: ResponseData) => !val });
      return res.status(request.StatusCode).send(request);
    } catch (error) {
      return res.status(error.StatusCode).send(error);
    }
  }

  async Put(req: Request, res: Response): Promise<Response<ResponseData>> {
    const session = await Mongoose.startSession();
    session.startTransaction();
    try {
      const request = await UserCore.findByIdAndUpdate({ req, query: req.body, callback: (val: ResponseData) => !val, opt: { new: true, session } });
      await session.commitTransaction();
      return res.status(request.StatusCode).send(request);
    } catch (error) {
      session.abortTransaction();
      return res.status(error.StatusCode).send(error);
    }
  }

  async Delete(req: Request, res: Response): Promise<Response<ResponseData>> {
    try {
      const request = await UserCore.findByIdAndUpdate({
        req, query: { $bit: { IsActive: { xor: 1 } } },
        callback: (val: ResponseData) => !val || (val && val.CodeError === MessageCodes.INACTIVE_USER), opt: { new: true }
      });
      return res.status(request.StatusCode).send(request);
    } catch (error) {
      return res.status(error.StatusCode).send(error);
    }
  }
}

export default User.getInstance();

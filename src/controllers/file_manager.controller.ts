import { Response, Request } from 'express';
import ResponseData from '../models/response_data.model';
import Mongoose from 'mongoose';
import UserCore from '../core/user.core';
import FileManagerCore from '../core/file_manager.core';
import Moment from 'moment';
class FileManager {
  private static instance: FileManager;

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  async GetId(req: Request, res: Response): Promise<Response<ResponseData>> {
    try {
      await UserCore.findById({ req, callback: (val: ResponseData) => !val });
      const request = await FileManagerCore.getFiles({ req, callback: (vali: any) => vali.length > 0 });
      return res.status(request.StatusCode).send(request);
    } catch (error) {
      return res.status(error.StatusCode).send(error);
    }
  }

  async Post(req: Request, res: Response): Promise<Response<ResponseData>> {
    const session = await Mongoose.startSession();
    session.startTransaction();
    try {
      const request = await UserCore.findByIdAndUpdate({
        req, query: { LastUploadDatabase: Moment.utc().toDate() },
        callback: (val: ResponseData) => !val, opt: { new: true, session }
      });
      await FileManagerCore.save({ req, query: request, callback: (val: any) => true });
      await session.commitTransaction();
      return res.status(request.StatusCode).send(request);
    } catch (error) {
      await session.abortTransaction();
      return res.status(error.StatusCode).send(error);
    }
  }

  async PostImage(req: Request, res: Response): Promise<Response<ResponseData>> {
    const session = await Mongoose.startSession();
    session.startTransaction();
    try {
      const request = await FileManagerCore.saveImage({ req, callback: (val: ResponseData) => !val });
      const user = await UserCore.findByIdAndUpdate({ req, query: { UrlImage: request.Message }, callback: (val: any) => !val, opt: { new: true, session } });
      await session.commitTransaction();
      return res.status(user.StatusCode).send(user);
    } catch (error) {
      await session.abortTransaction();
      return res.status(error.StatusCode).send(error);
    }
  }

}

export default FileManager.getInstance();

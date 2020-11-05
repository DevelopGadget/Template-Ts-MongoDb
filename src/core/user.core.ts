import { MessageCodes } from '../config/codes.config';
import ResponseData from '../models/response_data.model';
import UserMongoose from '../models/user.model';
import { Request } from 'express';
import Config from '../config/app.config';
import QueryRequest from '../models/query_request.model';

class User {
    private static instance: User;

    public static getInstance(): User {
        if (!User.instance) {
            User.instance = new User();
        }
        return User.instance;
    }

    public async findByIdAndUpdate({ optionalParamaters = '-Password -EmailValidationCode -CreateAt', callback, req, query, opt }: QueryRequest): Promise<ResponseData> {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await UserMongoose.findByIdAndUpdate(req.headers.Id ?? req.headers.id, query, opt)
                    .where('EmailAddress')
                    .equals(req.headers.EmailAddress ?? req.headers.emailaddress)
                    .select(optionalParamaters);
                const validation = Config.ValidationError(request.toJSON());
                if (callback(validation))
                    resolve({ IsError: false, StatusCode: 200, Message: request.toJSON(), CodeError: null });
                else
                    reject(validation);
            } catch (error) {
                reject({ IsError: true, StatusCode: 400, Message: error, CodeError: MessageCodes.ERROR_IN_REQUEST });
            }
        });
    }

    public async findById({ optionalParamaters = '-Password -EmailValidationCode -CreateAt', callback, req, }: QueryRequest): Promise<ResponseData> {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await UserMongoose.findById(req.headers.Id ?? req.headers.id)
                    .where('EmailAddress')
                    .equals(req.headers.EmailAddress ?? req.headers.emailaddress)
                    .select(optionalParamaters);
                const validation = Config.ValidationError(request);
                if (callback(validation))
                    resolve({ IsError: false, StatusCode: 200, Message: request.toJSON(), CodeError: null });
                else
                    reject(validation);
            } catch (error) {
                reject({ IsError: true, StatusCode: 400, Message: error, CodeError: MessageCodes.ERROR_IN_REQUEST });
            }
        });
    }

    public async findOneAndUpdate({ optionalParamaters = '-Password -EmailValidationCode -CreateAt', callback, req, query, opt, subReq }: QueryRequest): Promise<ResponseData> {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await UserMongoose.findOneAndUpdate(subReq, query, opt)
                    .where('EmailAddress')
                    .equals(req.headers.EmailAddress ?? req.headers.emailaddress)
                    .select(optionalParamaters);
                const validation = Config.ValidationError(request);
                if (callback(validation))
                    resolve({ IsError: false, StatusCode: 200, Message: request.toJSON(), CodeError: null });
                else
                    reject(validation);
            } catch (error) {
                reject({ IsError: true, StatusCode: 400, Message: error, CodeError: MessageCodes.ERROR_IN_REQUEST });
            }
        });
    }

    public async save({ callback, req, }: QueryRequest): Promise<ResponseData> {
        return new Promise(async (resolve, reject) => {
            try {
                const request = await new UserMongoose(req.body).save();
                const validation = Config.ValidationError(request);
                if (callback(validation))
                    resolve({
                        IsError: false, StatusCode: 200,
                        Message: { _id: request._id, EmailAddress: request.EmailAddress, EmailIsValidated: false },
                        CodeError: null
                    });
                else
                    reject(validation);
            } catch (error) {
                reject({ IsError: true, StatusCode: 400, Message: error, CodeError: MessageCodes.ERROR_IN_REQUEST });
            }
        });
    }

}

export default User.getInstance();

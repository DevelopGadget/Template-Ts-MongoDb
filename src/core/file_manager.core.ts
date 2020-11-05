import ResponseData from '../models/response_data.model';
import QueryRequest from '../models/query_request.model';
import Config from '../config/app.config';
import Moment from 'moment';
import { MessageCodes } from '../config/codes.config';
import { extname } from 'path';

class FileManager {
    private static instance: FileManager;

    public static getInstance(): FileManager {
        if (!FileManager.instance) {
            FileManager.instance = new FileManager();
        }
        return FileManager.instance;
    }

    public async getFiles({ callback, req }: QueryRequest): Promise<ResponseData> {
        return new Promise(async (resolve, reject) => {
            try {
                const id = (req.headers.id ?? req.headers.Id) as string;
                var [files] = await Config.getBucket().getFiles({ prefix: id,  });
                files = files.filter(item => item.name === `${id}/${id}.db`);
                if (callback(files))
                    resolve({ IsError: false, StatusCode: 200, Message: await this.getSignedUrl(files[files.length - 1], Moment()), CodeError: null });
                else
                    reject({ IsError: true, StatusCode: 404, Message: MessageCodes.ERROR_FILE_NOT_FOUND, CodeError: MessageCodes.ERROR_FILE_NOT_FOUND });
            } catch (error) {
                reject({ IsError: true, StatusCode: 400, Message: error, CodeError: MessageCodes.ERROR_IN_REQUEST });
            }
        });
    }

    public async save({ callback, req, query }: QueryRequest): Promise<ResponseData> {
        return new Promise(async (resolve, reject) => {
            try {
                const currentDate = Moment();
                const file = Config.getBucket().file(`${query.Message._id}/${query.Message._id}${extname(req.file.originalname)}`);
                await file.save(req.file.buffer, {
                    contentType: req.file.mimetype,
                    resumable: false,
                    metadata: { contentType: req.file.mimetype, ID: query.Message._id, EmailAddress: query.Message.EmailAddress },
                });
                resolve({
                    IsError: false, StatusCode: 200,
                    Message: { DownloadURL: await this.getSignedUrl(file, currentDate), ...query.Message }, CodeError: null
                });
            } catch (error) {
                reject({ IsError: true, StatusCode: 406, Message: error, CodeError: MessageCodes.ERROR_IN_UPLOAD_FILE });
            }
        });
    }

    public async saveImage({ callback, req, query }: QueryRequest): Promise<ResponseData> {
        return new Promise(async (resolve, reject) => {
            try {
                const link = 'https://firebasestorage.googleapis.com/v0/b/';
                const ID = (req.headers.Id ?? req.headers.id) as string;
                const EMAIL = (req.headers.EmailAddress ??
                    req.headers.emailaddress) as string;
                const file = Config.getBucket().file(`${ID}/${ID}${extname(req.file.originalname)}`);
                await file.save(req.file.buffer, {
                    contentType: req.file.mimetype,
                    public: true,
                    resumable: false,
                    metadata: { contentType: req.file.mimetype, ID, EmailAddress: EMAIL, metadata: { firebaseStorageDownloadTokens: ID }, },
                });
                resolve({
                    IsError: false, StatusCode: 200,
                    Message: `${link}${Config.getBucket().name}/o/${encodeURIComponent(file.name)}?alt=media&token=${ID}`, CodeError: null
                });
            } catch (error) {
                reject({ IsError: true, StatusCode: 406, Message: error, CodeError: MessageCodes.ERROR_IN_UPLOAD_FILE });
            }
        });
    }

    private getSignedUrl(file: any, currentDate: Moment.Moment): any {
        return file.getSignedUrl({
            action: 'read',
            expires: currentDate.add('2', 'days').toLocaleString(),
        });
    }

}

export default FileManager.getInstance();
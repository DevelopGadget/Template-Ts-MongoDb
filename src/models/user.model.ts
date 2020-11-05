import Mongoose, { Schema, Document } from 'mongoose';
import Joi from '@hapi/joi';
import Moment from 'moment';
import AppConfig from '../config/app.config';

export interface User extends Document {
  FirstName?: string;
  LastName?: string;
  Password: string;
  EmailAddress: string;
  UrlImage?: string;
  Gender?: string;
  EmailValidationCode?: string;
  EmailIsValidated: boolean;
  IsActive: number | boolean;
  CountryCode?: string;
  CityName?: string;
  CreateAt: Date;
  LastLogin?: Date;
  LastCutOffDate?: Date;
  LastUploadDatabase?: Date;
  CutOffDate?: number;
}

const userSchema: Schema = new Schema({
  FirstName: { type: String, required: true, maxlength: 50, minlength: 1, uppercase: true },
  LastName: { type: String, required: true, maxlength: 50, minlength: 1, uppercase: true },
  EmailAddress: {
    type: String, required: true, maxlength: 255, minlength: 1, lowercase: true, unique: true
  },
  Password: { type: String, required: true },
  UrlImage: { type: String, default: 'notFound.png' },
  Gender: { type: String, validate: (value: string) => value === 'M' || value === 'F' },
  EmailValidationCode: { type: String },
  EmailIsValidated: { type: Boolean, default: false },
  IsActive: { type: Number, default: true },
  CountryCode: { type: String, maxlength: 3, uppercase: true },
  CityName: { type: String, maxlength: 50, uppercase: true },
  CreateAt: { type: Date, default: Moment.utc().toDate() },
  LastLogin: { type: Date },
  LastCutOffDate: { type: Date },
  LastUploadDatabase: { type: Date, default: Moment.utc().toDate() },
  CutOffDate: { type: Number },
});

export default Mongoose.model<User>('User', userSchema);

export const STRING_VAL: Joi.Schema = Joi.string().optional().max(50).when('IsUpdate', { is: false, then: Joi.required() });

export const USER_OBJECT: Joi.ObjectSchema = Joi.object({
  IsUpdate: Joi.bool().default(false),
  FirstName: STRING_VAL,
  LastName: STRING_VAL,
  EmailAddress: Joi.string().email().required().when('IsUpdate', { is: true, then: Joi.string().optional().strip() }),
  Password: Joi.string().required().min(8).max(16).regex(AppConfig.PASSWORD_REG).when('IsUpdate', { is: true, then: Joi.string().optional().strip(true) }),
  Gender: Joi.string().valid().optional().valid('M', 'F'),
  CountryCode: Joi.string().optional().regex(new RegExp(/[A-Z]{1,3}$/)).max(3),
  CityName: Joi.string().optional().max(50),
  CutOffDate: Joi.number().optional(),
  LastCutOffDate: Joi.date().optional(),
  LastUploadDatabase: Joi.date().optional(),
});

export const VALIDATION_CODE: Joi.ObjectSchema = Joi.object({
  Id: Joi.string().required(),
  EmailAddress: Joi.string().email().required(),
  EmailValidationCode: Joi.string().required(),
});

export const VALIDATION_RESEND: Joi.ObjectSchema = Joi.object({
  Id: Joi.string().required(),
  EmailAddress: Joi.string().email().required(),
});

export const LOGIN: Joi.ObjectSchema = Joi.object({
  EmailAddress: Joi.string().email().required(),
  Password: Joi.string().required().min(8).max(16).regex(AppConfig.PASSWORD_REG),
});

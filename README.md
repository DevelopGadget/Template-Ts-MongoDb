## :open_file_folder: Template TypeScript Backend :factory:
Template base for a web service, with authentication based on jwt, MongoDb database and TypeScript.

> Enviroments

**:hammer: nodemon.json**

 - ENCRYPT  variable used as password to encrypt
 - CLOUD_NAME variable used colud_name of cloudinary
 - API_KEY variable used api_key of cloudinary
 - API_SECRET variable used api_secret of cloudinary
 - SENDGRID_API_KEY variable api_key of send grid
 - TEMPLATE variable template for send email
 - EMAIL variable used from email send

> Keys for encrypt and decrypt JWT

**:hammer: Create file private.key and public.key in src folder :open_file_folder:**

you can create RSA keys on this [website](https://csfieldguide.org.nz/en/interactives/rsa-key-generator/)

> :hammer: Built WIth :rocket:

 - [Express Js](https://expressjs.com/)
 - [Joi](https://hapi.dev/module/joi/)
 - [Sendgrid](https://www.npmjs.com/package/@sendgrid/mail)
 - [Cloudinary](https://www.npmjs.com/package/cloudinary)
 - [Cors](https://www.npmjs.com/package/cors)
 - [Crypto Js](https://cryptojs.gitbook.io/docs/)
 - [EmailDomainValidator](https://www.npmjs.com/package/email-domain-validator)
 - [JsonWebToken](https://github.com/auth0/node-jsonwebtoken)
 - [Mongoose](https://mongoosejs.com/)
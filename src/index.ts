import express, { json, urlencoded, NextFunction, Response, Request } from 'express';
import morgan from 'morgan';
import User from './routes/user.model';
import FileManager from './routes/file_manager.model';
import Config from './config/app.config';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import Auth from './routes/auth.model';
import compression from 'compression';
import cache from 'nocache';

class Index {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.AppConfig();
  }

  private AppConfig() {
    this.app.set('port', process.env.PORT || 3000);
    this.app.use(morgan('dev'));
    this.app.use(json());
    this.app.use(helmet());
    this.app.use(cache());
    this.app.use(compression());
    this.app.use(mongoSanitize());
    this.app.use(this.defaultHeader);
    this.app.use(urlencoded({ extended: false }));
    this.ConfigRouters();
  }

  private ConfigRouters() {
    const user = new User(this.app);
    const file = new FileManager(this.app);
    const auth = new Auth(this.app);
  }

  private defaultHeader(req: Request, res: Response, next: NextFunction) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Accept', 'application/json');
    next();
  }

  public RunServer() {
    this.app.listen(process.env.PORT, async () => {
      await Config.InitDatabase();
    });
  }
}

export default new Index();

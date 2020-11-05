import { Router } from 'express';
import FileController from '../controllers/file_manager.controller';
import FileMiddleware from '../middlewares/file_manager.middlewares';
import UserMiddleware from '../middlewares/user.middlewares';

class FileManager {
  constructor(private ROUTER: Router) {
    this.ConfigRouter();
  }

  private ConfigRouter() {
    this.ROUTER.get('/file', UserMiddleware.IsValidToken, FileController.GetId);
    this.ROUTER.post('/file', UserMiddleware.IsValidToken, FileMiddleware.getMulterConfig().single('db'), FileController.Post);
    this.ROUTER.post('/image', UserMiddleware.IsValidToken, FileMiddleware.getMulterConfig(true).single('image'), FileController.PostImage);
  }
}

export default FileManager;

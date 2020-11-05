import MulterModule from 'multer';

class FileManager {
  private static instance: FileManager;

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  public getMulterConfig(isImage: boolean = false): any {
    return MulterModule({
      fileFilter: isImage ? this.FileImage : this.FileFilter,
      limits: {
        files: 1,
        fileSize: 5000000,
      },
      storage: MulterModule.memoryStorage(),
    });
  }

  public FileFilter(req: any, file: any, cb: any) {
    if (!file.originalname.match(/\.(db|md5)$/)) {
      return cb(new Error('Only db files'), false);
    }
    cb(null, true);
  }

  public FileImage(req: any, file: any, cb: any) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|svg|gif)$/)) {
      return cb(new Error('Only db files'), false);
    }
    cb(null, true);
  }
}

export default FileManager.getInstance();

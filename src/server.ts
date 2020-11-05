import App from './index';
class Server {
  public async InitServer() {
    App.RunServer();
  }
}

new Server().InitServer();

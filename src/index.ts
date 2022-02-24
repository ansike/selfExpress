import http, { IncomingMessage, ServerResponse } from "http";
import { RouteType, HandleFnType } from "./interface";
import Router from "./Router";
// import https from "https";

class SelfExpress {
  _router = new Router();
  server: null | http.Server = null;
  route: {
    all: RouteType[];
  } = {
    all: [],
  };
  constructor() {}
  use(path: string, handle: HandleFnType) {
    this.route.all.push({
      path,
      method: "*",
      handle,
    });
    console.log("use:", this.route.all);
  }

  get(path: string, handle: HandleFnType) {
    this._router.get(path, handle);
  }
  
  listen(port: number, cb: (() => void) | undefined) {
    this.server = http.createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        // if (!(res as any).send) {
        //   (res as any).send = (body: any) => {
        //     res.writeHead(200, {
        //       "Content-Type": "text/plain",
        //     });
        //     res.end(body);
        //   };
        // }
        return this._router.handle(req, res);
      }
    );
    this.server?.listen.apply(this.server, [port, cb]);
    console.log("server start. listen port:", port);
  }
}

export default SelfExpress;

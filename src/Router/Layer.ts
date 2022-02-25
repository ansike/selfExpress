import { IncomingMessage, ServerResponse } from "http";
import { HandleFnType } from "../interface";
import Route from "./Route";

class Layer {
  name: string; 
  path: string;
  method?: string;
  handle: HandleFnType;
  route?: Route;
  constructor(path: string, fn: HandleFnType) {
    this.name = fn.name || "<anonymous>";
    this.path = path;
    this.handle = fn;
  }
  handle_request(req: IncomingMessage, res: ServerResponse) {
    const fn = this.handle;
    if (fn) {
      fn(req, res);
    }
  }
  isMatch(path: string) {
    if (path === "*" || path === this.path) {
      return true;
    }
    return false;
  }
}

export default Layer;

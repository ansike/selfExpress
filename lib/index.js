'use strict';

var http = require('http');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);

class Layer {
    constructor(path, fn) {
        this.name = fn.name || "<anonymous>";
        this.path = path;
        this.handle = fn;
    }
    handle_request(req, res) {
        const fn = this.handle;
        if (fn) {
            fn(req, res);
        }
    }
    isMatch(path) {
        if (path === "*" || path === this.path) {
            return true;
        }
        return false;
    }
}

class Route {
    constructor(path) {
        this.stack = [];
        this.methods = {};
        this.path = path;
        this.stack = [];
        this.methods = {};
    }
    _handle_method(method) {
        const name = method.toLowerCase();
        return Boolean(this.methods[name]);
    }
    get(fn) {
        const layer = new Layer("/", fn);
        layer.method = "get";
        this.methods["get"] = true;
        this.stack.push(layer);
        return this;
    }
    dispatch(req, res) {
        var _a;
        const method = (_a = req.method) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const len = this.stack.length;
        for (let i = 0; i < len; i++) {
            const layer = this.stack[i];
            if (this.methods[method] && method === layer.method) {
                return layer.handle_request(req, res);
            }
        }
    }
}

class Router {
    constructor() {
        this.stack = [
            new Layer("*", 
            // method: "*",
            function handle(req, res) {
                res.writeHead(200, {
                    "Content-Type": "text/plain",
                });
                res.end("404");
            }),
        ];
    }
    get(path, handle) {
        const route = this.route(path);
        route.get(handle);
        return this;
    }
    handle(req, res) {
        const len = this.stack.length;
        for (let i = 1; i < len; i++) {
            const layer = this.stack[i];
            if (layer.isMatch(req.url || "")) {
                return layer.handle_request(req, res);
            }
        }
        return this.stack[0].handle_request(req, res);
    }
    route(path) {
        const route = new Route(path);
        const layer = new Layer(path, (req, res) => {
            route.dispatch(req, res);
        });
        layer.route = route;
        this.stack.push(layer);
        return route;
    }
}

// import https from "https";
class SelfExpress {
    constructor() {
        this._router = new Router();
        this.server = null;
        this.route = {
            all: [],
        };
    }
    use(path, handle) {
        this.route.all.push({
            path,
            method: "*",
            handle,
        });
        console.log("use:", this.route.all);
    }
    get(path, handle) {
        this._router.get(path, handle);
    }
    listen(port, cb) {
        var _a;
        this.server = http__default["default"].createServer((req, res) => {
            // if (!(res as any).send) {
            //   (res as any).send = (body: any) => {
            //     res.writeHead(200, {
            //       "Content-Type": "text/plain",
            //     });
            //     res.end(body);
            //   };
            // }
            return this._router.handle(req, res);
        });
        (_a = this.server) === null || _a === void 0 ? void 0 : _a.listen.call(this.server, port, cb);
        console.log("server start. listen port:", port);
    }
}

module.exports = SelfExpress;

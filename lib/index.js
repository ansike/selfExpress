'use strict';

var http = require('http');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);

class Router {
    constructor() {
        this.stack = [
            {
                path: "*",
                method: "*",
                handle: function (req, res) {
                    res.writeHead(200, {
                        "Content-Type": "text/plain",
                    });
                    res.end("404");
                },
            },
        ];
    }
    get(path, handle) {
        this.stack.push({
            path,
            method: "GET",
            handle,
        });
    }
    handle(req, res) {
        const len = this.stack.length;
        for (let i = 1; i < len; i++) {
            const { path, method, handle } = this.stack[i];
            if ((path === "*" || path === req.url) &&
                (method === "*" || method === req.method)) {
                return handle && handle(req, res);
            }
        }
        return this.stack[0].handle(req, res);
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
        (_a = this.server) === null || _a === void 0 ? void 0 : _a.listen.apply(this.server, [port, cb]);
        console.log("server start. listen port:", port);
    }
}

module.exports = SelfExpress;

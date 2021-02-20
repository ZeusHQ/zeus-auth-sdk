"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var camelcase_keys_1 = __importDefault(require("camelcase-keys"));
var universal_cookie_1 = __importDefault(require("universal-cookie"));
var handleAPIResponseObject = function (result, resolve) { return __awaiter(void 0, void 0, void 0, function () {
    var obj;
    return __generator(this, function (_a) {
        obj = camelcase_keys_1.default(result);
        if (obj.success) {
            resolve([obj.object, null]);
        }
        else {
            resolve([null, obj.errors]);
        }
        return [2 /*return*/];
    });
}); };
var decamelize = function (params, separator) {
    separator = typeof separator === 'undefined' ? '_' : separator;
    var keys = Object.keys(params);
    return keys.reduce(function (output, key) {
        var newKey = key
            .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
            .toLowerCase();
        if (typeof (params[key]) === "object") {
            output[newKey] = decamelize(params[key], separator);
        }
        else {
            output[newKey] = params[key];
        }
        return output;
    }, {});
};
var SIGNUP_URL = "/api/v1/users";
var LOGIN_EMAIL_PASSWORD_URL = "/api/v1/sessions";
var ME_URL = "/api/v1/users/me";
var ZeusAuthService = /** @class */ (function () {
    function ZeusAuthService(publicKey, onTokenExpired, local) {
        this.optionsToRequestParams = function (options) {
            return Object.keys(options).map(function (key) { return key + '=' + options[key]; }).join('&');
        };
        this.publicKey = publicKey;
        this.baseUrl = local ? "http://localhost:3003" : "https://auth.zeusdev.io";
        this.onTokenExpired = onTokenExpired;
    }
    ZeusAuthService.init = function (publicKey, onTokenExpired, local) {
        if (local === void 0) { local = false; }
        if (!ZeusAuthService.instance) {
            ZeusAuthService.instance = new ZeusAuthService(publicKey, onTokenExpired, local);
        }
        return ZeusAuthService.instance;
    };
    ZeusAuthService.prototype.signup = function (user) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.fetchUnauthed(_this.publicKey, _this.baseUrl + SIGNUP_URL, { user: user }, 'POST')
                .then(function (result) { return handleAPIResponseObject(result, resolve); })
                .catch(function (err) { return reject(err); });
        });
    };
    ZeusAuthService.prototype.loginWithEmailPassword = function (session) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.fetchUnauthed(_this.publicKey, _this.baseUrl + LOGIN_EMAIL_PASSWORD_URL, { session: session }, 'POST')
                .then(function (result) { return handleAPIResponseObject(result, resolve); })
                .catch(function (err) { return reject(err); });
        });
    };
    ZeusAuthService.prototype.me = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.fetchAuthed(_this.publicKey, _this.baseUrl + ME_URL, {}, 'GET')
                .then(function (result) { return handleAPIResponseObject(result, resolve); })
                .catch(function (err) { return reject(err); });
        });
    };
    ZeusAuthService.prototype.saveToken = function (token) {
        var cookies = new universal_cookie_1.default();
        cookies.set('token', token, { path: '/' });
        return Promise.resolve();
    };
    ZeusAuthService.prototype.checkAuthToken = function (publicKey, token) {
        return this.fetchAuthed(publicKey, ME_URL, {}, 'GET', token);
    };
    ZeusAuthService.prototype.authenticateTokenSsr = function (publicKey, req) {
        return __awaiter(this, void 0, void 0, function () {
            var cookies, token, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cookies = new universal_cookie_1.default(req ? req.headers.cookie : null);
                        token = cookies.get('token');
                        if (!token) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkAuthToken(publicKey, token)];
                    case 1:
                        response = _a.sent();
                        if (!response.id) {
                            cookies.remove('token');
                            // const navService = new NavService();
                            // navService.redirectUser('/login', ctx);
                        }
                        return [2 /*return*/, { user: response, token: token }];
                    case 2: return [2 /*return*/, {}];
                }
            });
        });
    };
    ZeusAuthService.prototype.fetch = function (url, data, type) {
        return fetch("" + url, {
            body: JSON.stringify(decamelize(data)),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            method: type
        })
            .then(function (response) {
            return response.json();
        })
            .then(this.handleErrors)
            .catch(function (error) {
            throw error;
        });
    };
    ZeusAuthService.prototype.fetchUnauthed = function (publicKey, url, data, type) {
        var _this = this;
        var fetchOpts = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-ZEUS-KEY': publicKey,
            },
            method: type
        };
        var queryParams = (type === "GET" && data && this.optionsToRequestParams(decamelize(data))) || {};
        if (type !== "GET" && data) {
            fetchOpts.body = JSON.stringify(decamelize(data));
        }
        return fetch(url + "?" + queryParams, fetchOpts)
            .then(function (response) {
            var authHeader = response.headers.get("Authorization");
            if (authHeader) {
                var token = authHeader.split("Bearer ")[1];
                _this.saveToken(token);
            }
            return response.json();
        })
            .then(this.handleErrors)
            .catch(function (error) {
            throw error;
        });
    };
    ZeusAuthService.prototype.fetchAuthed = function (publicKey, url, data, type, tokenOverride) {
        var _this = this;
        var cookies = new universal_cookie_1.default();
        var token = cookies.get('token');
        var actualToken = tokenOverride ? tokenOverride : token;
        if (!actualToken) {
            var cookies_1 = new universal_cookie_1.default();
            cookies_1.remove('token');
            return this.onTokenExpired();
        }
        var fetchOpts = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-ZEUS-KEY': publicKey,
                Authorization: 'Bearer ' + actualToken
            },
            method: type
        };
        var queryParams = (type === "GET" && data && this.optionsToRequestParams(decamelize(data))) || {};
        if (type !== "GET" && data) {
            fetchOpts.body = JSON.stringify(decamelize(data));
        }
        return fetch(url + "?" + queryParams, fetchOpts)
            .then(function (response) {
            if (response.status === 401) {
                var cookies_2 = new universal_cookie_1.default();
                cookies_2.remove('token');
                // Router.push("/auth/login");
                // } else if (type === "GET" && response.status === 404) {
                //     Router.push("/404");
                return _this.onTokenExpired();
            }
            else {
                return response.json();
            }
        })
            .then(this.handleErrors)
            .catch(function (error) {
            throw error;
        });
    };
    ZeusAuthService.prototype.handleErrors = function (response) {
        if (response === 'TypeError: Failed to fetch') {
            throw Error('Server error.');
        }
        return response;
    };
    return ZeusAuthService;
}());
exports.default = ZeusAuthService;
//# sourceMappingURL=AuthService.js.map
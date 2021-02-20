"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.AuthProvider = exports.AuthStateContext = void 0;
var react_1 = __importStar(require("react"));
exports.AuthStateContext = react_1.default.createContext({});
var initialState = {
    me: null,
    loggedIn: false,
};
var ActionType;
(function (ActionType) {
    ActionType["SetMe"] = "setMe";
    ActionType["Logout"] = "logout";
})(ActionType || (ActionType = {}));
var reducer = function (state, action) {
    switch (action.type) {
        case ActionType.SetMe:
            return __assign(__assign({}, state), { me: action.payload, loggedIn: true });
        case ActionType.Logout:
            return __assign({}, initialState);
        default:
            throw new Error("Unhandled action type: " + action.type);
    }
};
var LOCAL_STORAGE_KEY = 'zeus.auth.storage';
var AuthProvider = function (_a) {
    var children = _a.children;
    var localState = null;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '');
    }
    var _b = react_1.useReducer(reducer, localState || initialState), state = _b[0], dispatch = _b[1];
    if (typeof localStorage !== 'undefined') {
        react_1.useEffect(function () {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        }, [state]);
    }
    return (react_1.default.createElement(exports.AuthStateContext.Provider, { value: [state, dispatch] }, children));
};
exports.AuthProvider = AuthProvider;
// useContext hook - export here to keep code for global auth state
// together in this file, allowing user info to be accessed and updated
// in any functional component using the hook
var useAuth = function () { return react_1.useContext(exports.AuthStateContext); };
exports.useAuth = useAuth;
//# sourceMappingURL=AuthProvider.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decamelize = void 0;
function decamelize(params, separator) {
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
}
exports.decamelize = decamelize;
var FetchService = /** @class */ (function () {
    function FetchService() {
    }
    return FetchService;
}());
exports.default = new FetchService();
//# sourceMappingURL=Fetch.js.map
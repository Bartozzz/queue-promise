"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require("babel-runtime/helpers/get");

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _basicCollection = require("basic-collection");

var _basicCollection2 = _interopRequireDefault(_basicCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RequestCollection = function (_BasicCollection) {
    (0, _inherits3.default)(RequestCollection, _BasicCollection);

    function RequestCollection() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, RequestCollection);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = RequestCollection.__proto__ || (0, _getPrototypeOf2.default)(RequestCollection)).call.apply(_ref, [this].concat(args))), _this), _this.index = 0, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    (0, _createClass3.default)(RequestCollection, [{
        key: "add",
        value: function add(request) {
            if (typeof request !== "function") {
                throw new Error("You must provide a valid function, not " + (typeof request === "undefined" ? "undefined" : (0, _typeof3.default)(request)) + ".");
            }

            (0, _get3.default)(RequestCollection.prototype.__proto__ || (0, _getPrototypeOf2.default)(RequestCollection.prototype), "set", this).call(this, this.index++, request);
        }
    }]);
    return RequestCollection;
}(_basicCollection2.default);

exports.default = RequestCollection;
module.exports = exports["default"];
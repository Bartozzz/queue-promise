"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Queue = function (_EventEmitter) {
    (0, _inherits3.default)(Queue, _EventEmitter);

    /**
     * @param   {object}    options
     * @param   {number}    options.concurrency - how many promises can be handled at the same time
     * @param   {number}    options.interval    - how often should new promises be handled (in ms)
     * @access  public
     */


    /**
     * @type    {boolean}
     */


    /**
     * @type    {number}
     */
    function Queue() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        (0, _classCallCheck3.default)(this, Queue);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Queue.__proto__ || (0, _getPrototypeOf2.default)(Queue)).call(this));

        _this.collection = new _map2.default();
        _this.unique = 0;
        _this.current = 0;
        _this.started = false;
        _this.interval = null;


        _this.options = (0, _extends3.default)({
            concurrency: 5,
            interval: 500
        }, options);
        return _this;
    }

    /**
     * Starts the queue.
     *
     * @emits   start
     * @emits   tick
     * @emits   request
     * @emits   error
     * @access  public
     */


    /**
     * @type    {Interval}
     */


    /**
     * @type    {number}
     */

    /**
     * @type    {Map}
     */


    (0, _createClass3.default)(Queue, [{
        key: "start",
        value: function start() {
            var _this2 = this;

            if (this.started) {
                return;
            }

            this.emit("start");

            this.started = true;
            this.interval = setInterval(function () {
                _this2.emit("tick");

                _this2.collection.forEach(function (promise, id) {
                    if (_this2.current + 1 > _this2.options.concurrency) {
                        return;
                    }

                    _this2.current++;
                    _this2.remove(id);

                    promise().then(function () {
                        for (var _len = arguments.length, output = Array(_len), _key = 0; _key < _len; _key++) {
                            output[_key] = arguments[_key];
                        }

                        _this2.emit.apply(_this2, ["resolve"].concat(output));
                    }).catch(function (error) {
                        _this2.emit("reject", error);
                    }).then(function () {
                        _this2.next();
                    });
                });
            }, this.options.interval);
        }

        /**
         * Stops the queue.
         *
         * @emits   stop
         * @access  public
         */

    }, {
        key: "stop",
        value: function stop() {
            this.emit("stop");

            this.started = false;
            this.interval = clearInterval(this.interval);
        }

        /**
         * Goes to the next request and stops the loop if there is no requests left.
         *
         * @emits   end
         * @access  private
         */

    }, {
        key: "next",
        value: function next() {
            if (--this.current === 0 && this.collection.size === 0) {
                this.emit("end");
                this.stop();
            }
        }
    }, {
        key: "add",
        value: function add(promise) {
            if (typeof promise !== "function") {
                throw new Error("You must provide a valid function, not " + (typeof promise === "undefined" ? "undefined" : (0, _typeof3.default)(promise)) + ".");
            }

            this.collection.set(this.unique++, promise);
        }
    }, {
        key: "remove",
        value: function remove(key) {
            this.collection.delete(key);
        }
    }]);
    return Queue;
}(_events2.default);

exports.default = Queue;
module.exports = exports["default"];
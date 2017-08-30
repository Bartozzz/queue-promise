"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

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

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _requestCollection = require("./collection/requestCollection");

var _requestCollection2 = _interopRequireDefault(_requestCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Queue = function (_RequestCollection) {
    (0, _inherits3.default)(Queue, _RequestCollection);

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
     * @type    {EventEmitter}
     */
    function Queue() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        (0, _classCallCheck3.default)(this, Queue);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Queue.__proto__ || (0, _getPrototypeOf2.default)(Queue)).call(this));

        _this.events = new _eventEmitter2.default();
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


    (0, _createClass3.default)(Queue, [{
        key: "start",
        value: function start() {
            var _this2 = this;

            if (this.started) {
                return;
            }

            this.events.emit("start");

            this.started = true;
            this.interval = setInterval(function () {
                _this2.events.emit("tick");

                _this2.each(function (promise, id) {
                    var _promise;

                    if (_this2.current + 1 > _this2.options.concurrency) {
                        return;
                    }

                    _this2.current++;
                    _this2.remove(id);

                    (_promise = promise()).then.apply(_promise, (0, _toConsumableArray3.default)(function (output) {
                        var _events;

                        (_events = _this2.events).emit.apply(_events, ["resolve"].concat((0, _toConsumableArray3.default)(output)));
                    })).catch(function (error) {
                        _this2.events.emit("reject", error);
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
            this.events.emit("stop");

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
            if (--this.current === 0 && this.size === 0) {
                this.events.emit("end");
                this.stop();
            }
        }

        /**
         * Sets a `callback` for an `event`.
         *
         * @param   {string}    event       - event name
         * @param   {function}  callback    - event callback
         * @access  public
         */

    }, {
        key: "on",
        value: function on(event, callback) {
            this.events.on(event, callback);
        }
    }]);
    return Queue;
}(_requestCollection2.default);

exports.default = Queue;
module.exports = exports["default"];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A simple and small library for promise-based queues.
 */
var Queue = function (_EventEmitter) {
  _inherits(Queue, _EventEmitter);

  /**
   * Initializes a new Queue instance with provided options.
   *
   * @param   {object}    options
   * @param   {number}    options.concurrency how many promises can be
   *                                          handled at the same time
   * @param   {number}    options.interval    how often should new promises be
   *                                          handled (in ms)
   */


  /**
   * Whenever the queue has started.
   *
   * @type    {boolean}
   */


  /**
   * Amount of promises currently handled.
   *
   * @type    {number}
   */

  /**
   * A collection to store unresolved promises in.
   *
   * @type    {Map}
   */
  function Queue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Queue);

    // Default options:
    var _this = _possibleConstructorReturn(this, (Queue.__proto__ || Object.getPrototypeOf(Queue)).call(this));

    _this.collection = new Map();
    _this.unique = 0;
    _this.current = 0;
    _this.options = {};
    _this.started = false;
    _this.options = _extends({
      concurrency: 5,
      interval: 500
    }, options);
    return _this;
  }

  /**
   * Starts the queue if it has not been started yet.
   *
   * @emits   start
   * @emits   tick
   * @emits   request
   * @emits   error
   */


  /**
   * Queue interval.
   *
   * @type    {IntervalID}
   */


  /**
   * Queue config.
   *
   * @type    {Object}
   */


  /**
   * Used to generate unique id for each promise.
   *
   * @type    {number}
   */


  _createClass(Queue, [{
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
          // Maximum amount of parallel concurrencies:
          if (_this2.current + 1 > _this2.options.concurrency) {
            return;
          }

          _this2.current++;
          _this2.remove(id);

          Promise.resolve(promise()).then(function () {
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
      }, parseInt(this.options.interval));
    }

    /**
     * Stops the queue.
     *
     * @emits   stop
     */

  }, {
    key: "stop",
    value: function stop() {
      this.emit("stop");

      clearInterval(this.interval);

      this.started = false;
    }

    /**
     * Goes to the next request and stops the loop if there is no requests left.
     *
     * @emits   end
     */

  }, {
    key: "next",
    value: function next() {
      if (--this.current === 0 && this.collection.size === 0) {
        this.emit("end");
        this.stop();
      }
    }

    /**
     * Adds a promise to the queue.
     *
     * @param   {Promise}   promise Promise to add to the queue
     * @throws  {Error}             when the promise is not a function
     */

  }, {
    key: "add",
    value: function add(promise) {
      if (typeof promise !== "function") {
        throw new Error("You must provide a function, not " + (typeof promise === "undefined" ? "undefined" : _typeof(promise)) + ".");
      }

      this.collection.set(this.unique++, promise);
    }

    /**
     * Removes a promise from the queue.
     *
     * @param   {number}    key     Promise id
     * @return  {boolean}
     */

  }, {
    key: "remove",
    value: function remove(key) {
      return this.collection.delete(key);
    }
  }]);

  return Queue;
}(_events2.default);

exports.default = Queue;
module.exports = exports["default"];
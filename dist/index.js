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
 * A small and simple library for promise-based queues. It will resolve enqueued
 * functions concurrently at a specified speed. When a task is being resolved or
 * rejected, an event will be emitted.
 *
 * @class   Queue
 * @extends EventEmitter
 */
var Queue = function (_EventEmitter) {
  _inherits(Queue, _EventEmitter);

  /**
   * Initializes a new Queue instance with provided options.
   *
   * @param   {Object}  options
   * @param   {number}  options.concurrent
   * @param   {number}  options.interval
   */


  /**
   * @type    {boolean}
   */


  /**
   * Amount of tasks currently handled by the Queue.
   *
   * @type    {number}
   */

  /**
   * A stack to store unresolved tasks.
   *
   * @type    {Map}
   */
  function Queue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Queue);

    // Default options:
    var _this = _possibleConstructorReturn(this, (Queue.__proto__ || Object.getPrototypeOf(Queue)).call(this));

    _this.stack = new Map();
    _this.unique = 0;
    _this.current = 0;
    _this.options = {};
    _this.started = false;
    _this.options = _extends({
      concurrent: 5,
      interval: 500
    }, options);

    // Backward compatibility:
    if (options.concurrency) {
      _this.options.concurrent = options.concurrency;
    }
    return _this;
  }

  /**
   * Starts the queue if it has not been started yet.
   *
   * @emits   start
   * @emits   tick
   * @emits   resolve
   * @emits   reject
   * @return  {void}
   * @access  public
   */


  /**
   * @type    {IntervalID}
   */


  /**
   * Queue config.
   *
   * @type    {Object}
   */


  /**
   * Used to generate unique id for each task.
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

        _this2.stack.forEach(function (promise, id) {
          // Maximum amount of parallel concurrencies:
          if (_this2.current + 1 > _this2.options.concurrent) {
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
     * @return  {void}
     * @access  public
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
     * @return  {void}
     * @access  private
     */

  }, {
    key: "next",
    value: function next() {
      if (--this.current === 0 && this.stack.size === 0) {
        this.emit("end");
        this.stop();
      }
    }

    /**
     * Adds a promise to the queue.
     *
     * @param   {Function}  promise Promise to add to the queue
     * @throws  {Error}             When promise is not a function
     * @return  {void}
     * @access  public
     */

  }, {
    key: "add",
    value: function add(promise) {
      if (typeof promise !== "function") {
        throw new Error("You must provide a function, not " + (typeof promise === "undefined" ? "undefined" : _typeof(promise)) + ".");
      }

      this.stack.set(this.unique++, promise);
    }

    /**
     * Removes a task from the queue.
     *
     * @param   {number}    key     Promise id
     * @return  {boolean}
     * @access  private
     */

  }, {
    key: "remove",
    value: function remove(key) {
      return this.stack.delete(key);
    }

    /**
     * @see     add
     * @access  public
     */

  }, {
    key: "push",
    value: function push(promise) {
      this.add(promise);
    }

    /**
     * @see     remove
     * @access  private
     */

  }, {
    key: "pop",
    value: function pop(key) {
      return this.remove(key);
    }

    /**
     * @see     remove
     * @access  private
     */

  }, {
    key: "shift",
    value: function shift(key) {
      return this.remove(key);
    }
  }]);

  return Queue;
}(_events2.default);

exports.default = Queue;
module.exports = exports["default"];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

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

/**
 * A small and simple library for promise-based queues. It will resolve enqueued
 * functions concurrently at a specified speed. When a task is being resolved or
 * rejected, an event will be emitted.
 *
 * @class   Queue
 * @extends EventEmitter
 */
var Queue = function (_EventEmitter) {
  (0, _inherits3.default)(Queue, _EventEmitter);

  /**
   * Initializes a new Queue instance with provided options.
   *
   * @param   {Object}  options
   * @param   {number}  options.concurrent
   * @param   {number}  options.interval
   * @param   {boolean} options.start
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
   * A collection to store unresolved tasks. We use a Map here because V8 uses a
   * variant of hash tables that generally have O(1) complexity for retrieval
   * and lookup.
   *
   * @see     https://codereview.chromium.org/220293002/
   * @type    {Map}
   */
  function Queue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Queue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Queue.__proto__ || (0, _getPrototypeOf2.default)(Queue)).call(this));

    _this.tasks = new _map2.default();
    _this.unique = 0;
    _this.current = 0;
    _this.options = {};
    _this.started = false;


    _this.options = (0, _extends3.default)({
      concurrent: 5,
      interval: 500,
      start: true
    }, options);

    _this.options.interval = parseInt(_this.options.interval);
    _this.options.concurrent = parseInt(_this.options.concurrent);

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
   * @return  {void}
   * @access  public
   */


  /**
   * @type    {IntervalID}
   */


  /**
   * @type    {Object}
   */


  /**
   * Used to generate unique id for each task.
   *
   * @type    {number}
   */


  (0, _createClass3.default)(Queue, [{
    key: "start",
    value: function start() {
      var _this2 = this;

      if (!this.started) {
        this.emit("start");

        this.started = true;
        this.interval = setInterval(function () {
          return _this2.dequeue();
        }, this.options.interval);
      }
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

      this.started = false;
      clearInterval(this.interval);
    }

    /**
     * Goes to the next request and stops the loop if there is no requests left.
     *
     * @emits   end
     * @return  {void}
     * @access  private
     */

  }, {
    key: "finalize",
    value: function finalize() {
      if (--this.current === 0 && this.isEmpty) {
        this.emit("end");
        this.stop();
      }
    }

    /**
     * Resolves n concurrent promises from the queue.
     *
     * @return  {Promise<*>}
     * @emits   resolve
     * @emits   reject
     * @access  public
     */

  }, {
    key: "dequeue",
    value: function dequeue() {
      var _this3 = this;

      var promises = [];

      this.tasks.forEach(function (promise, id) {
        // Maximum amount of parallel concurrencies:
        if (_this3.current + 1 > _this3.options.concurrent) {
          return;
        }

        _this3.current++;
        _this3.tasks.delete(id);

        promises.push(_promise2.default.resolve(promise()));
      });

      return _promise2.default.all(promises).then(function (values) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(values), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var output = _step.value;
            _this3.emit("resolve", output);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return values;
      }).catch(function (error) {
        _this3.emit("reject", error);
        return error;
      }).then(function (output) {
        _this3.finalize();
        return output;
      });
    }

    /**
     * Adds a promise to the queue.
     *
     * @param   {Function|Array}  promise   Promise to add to the queue
     * @throws  {Error}                     When promise is not a function
     * @return  {void}
     * @access  public
     */

  }, {
    key: "enqueue",
    value: function enqueue(promise) {
      var _this4 = this;

      if (Array.isArray(promise)) {
        promise.map(function (p) {
          return _this4.enqueue(p);
        });
        return;
      }

      if (typeof promise !== "function") {
        throw new Error("You must provide a function, not " + (typeof promise === "undefined" ? "undefined" : (0, _typeof3.default)(promise)) + ".");
      }

      // (Re)start the queue if new tasks are being added and the queue has been
      // automatically started before:
      if (this.options.start) {
        this.start();
      }

      this.tasks.set(this.unique++, promise);
    }

    /**
     * @see     enqueue
     * @access  public
     */

  }, {
    key: "add",
    value: function add(promise) {
      this.enqueue(promise);
    }

    /**
     * Removes all tasks from the queue.
     *
     * @return  {void}
     * @access  public
     */

  }, {
    key: "clear",
    value: function clear() {
      this.tasks.clear();
    }

    /**
     * Checks whether the queue is empty, i.e. there's no tasks.
     *
     * @type  {boolean}
     * @access  public
     */

  }, {
    key: "isEmpty",
    get: function get() {
      return this.tasks.size === 0;
    }
  }]);
  return Queue;
}(_events2.default);

exports.default = Queue;
module.exports = exports["default"];
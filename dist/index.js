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
 * @example
 *    const queue = new Queue({
 *      concurrent: 1,
 *      interval: 2000
 *    });
 *
 *    queue.on("resolve", data => console.log(data));
 *    queue.on("reject", error => console.error(error));
 *
 *    queue.enqueue(asyncTaskA);
 *    queue.enqueue([asyncTaskB, asyncTaskC]);
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
   * @param   {number}  options.concurrent  How many tasks should be resolved at a time
   * @param   {number}  options.interval    How often should new tasks be resolved (ms)
   * @param   {boolean} options.start       If should resolve new tasks automatically
   * @return  {Queue}
   */


  /**
   * @type    {Object}  options
   * @type    {number}  options.concurrent  How many tasks should be resolved at a time
   * @type    {number}  options.interval    How often should new tasks be resolved (ms)
   * @type    {boolean} options.start       If should resolve new tasks automatically
   * @access  public
   */


  /**
   * @type    {IntervalID}
   * @access  private
   */

  /**
   * A collection to store unresolved tasks. We use a Map here because V8 uses a
   * variant of hash tables that generally have O(1) complexity for retrieval
   * and lookup.
   *
   * @see     https://codereview.chromium.org/220293002/
   * @type    {Map}
   * @access  private
   */
  function Queue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Queue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Queue.__proto__ || (0, _getPrototypeOf2.default)(Queue)).call(this));

    _this.tasks = new _map2.default();
    _this.uniqueId = 0;
    _this.currentlyHandled = 0;
    _this.options = {
      concurrent: 5,
      interval: 500,
      start: true
    };
    _this.started = false;


    _this.options = (0, _extends3.default)({}, _this.options, options);
    _this.options.interval = parseInt(_this.options.interval, 10);
    _this.options.concurrent = parseInt(_this.options.concurrent, 10);

    // Backward compatibility:
    if (options.concurrency) {
      _this.options.concurrent = parseInt(options.concurrency, 10);
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
   * @type    {boolean} Whether the queue has already started
   * @access  public
   */


  /**
   * @type    {number}  Amount of tasks currently handled by the Queue
   * @access  private
   */


  /**
   * @type    {number}  Used to generate unique id for each task
   * @access  private
   */


  (0, _createClass3.default)(Queue, [{
    key: "start",
    value: function start() {
      if (!this.started) {
        this.emit("start");

        this.started = true;
        this.intervalId = setInterval(this.dequeue.bind(this), this.options.interval);
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
      clearInterval(this.intervalId);
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
      if (--this.currentlyHandled === 0 && this.isEmpty) {
        this.emit("end");
        this.stop();
      }
    }

    /**
     * Resolves n concurrent promises from the queue.
     *
     * @return  {Promise<any>}
     * @emits   resolve
     * @emits   reject
     * @access  public
     */

  }, {
    key: "dequeue",
    value: function dequeue() {
      var _this2 = this;

      var promises = [];

      this.tasks.forEach(function (promise, id) {
        // Maximum amount of parallel concurrencies:
        if (_this2.currentlyHandled >= _this2.options.concurrent) {
          return;
        }

        _this2.currentlyHandled++;
        _this2.tasks.delete(id);

        promises.push(_promise2.default.resolve(promise()));
      });

      return _promise2.default.all(promises).then(function (values) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(values), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var output = _step.value;
            _this2.emit("resolve", output);
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
        _this2.emit("reject", error);
        return error;
      }).then(function (output) {
        _this2.finalize();
        return output;
      });
    }

    /**
     * Adds a promise to the queue.
     *
     * @param   {Function|Array}  tasks     Tasks to add to the queue
     * @throws  {Error}                     When task is not a function
     * @return  {void}
     * @access  public
     */

  }, {
    key: "enqueue",
    value: function enqueue(tasks) {
      var _this3 = this;

      if (Array.isArray(tasks)) {
        tasks.map(function (task) {
          return _this3.enqueue(task);
        });
        return;
      }

      if (typeof tasks !== "function") {
        throw new Error("You must provide a function, not " + (typeof tasks === "undefined" ? "undefined" : (0, _typeof3.default)(tasks)) + ".");
      }

      // (Re)start the queue if new tasks are being added and the queue should
      // resolve new tasks automatically:
      if (this.options.start) {
        this.start();
      }

      this.tasks.set(this.uniqueId++, tasks);
    }

    /**
     * @see     enqueue
     * @access  public
     */

  }, {
    key: "add",
    value: function add(tasks) {
      this.enqueue(tasks);
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
     * @type    {boolean}
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
module.exports = exports.default;
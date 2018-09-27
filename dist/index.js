"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
class Queue extends _events.default {
  /**
   * A collection to store unresolved tasks. We use a Map here because V8 uses a
   * variant of hash tables that generally have O(1) complexity for retrieval
   * and lookup.
   *
   * @see     https://codereview.chromium.org/220293002/
   * @type    {Map}
   * @access  private
   */

  /**
   * @type    {number}  Used to generate unique id for each task
   * @access  private
   */

  /**
   * @type    {IntervalID}
   * @access  private
   */

  /**
   * @type    {number}  Amount of tasks currently handled by the Queue
   * @access  private
   */

  /**
   * @type    {Object}  options
   * @type    {number}  options.concurrent  How many tasks should be resolved at a time
   * @type    {number}  options.interval    How often should new tasks be resolved (ms)
   * @type    {boolean} options.start       If should resolve new tasks automatically
   * @access  public
   */

  /**
   * @type    {boolean} Whether the queue has already started
   * @access  public
   */

  /**
   * @type    {boolean} Whether the queue has been forced to stop
   * @access  public
   */

  /**
   * Initializes a new Queue instance with provided options.
   *
   * @param   {Object}  options
   * @param   {number}  options.concurrent  How many tasks should be resolved at a time
   * @param   {number}  options.interval    How often should new tasks be resolved (ms)
   * @param   {boolean} options.start       If should resolve new tasks automatically
   * @return  {Queue}
   */
  constructor(options = {}) {
    super();

    _defineProperty(this, "tasks", new Map());

    _defineProperty(this, "uniqueId", 0);

    _defineProperty(this, "intervalId", void 0);

    _defineProperty(this, "currentlyHandled", 0);

    _defineProperty(this, "options", {
      concurrent: 5,
      interval: 500,
      start: true
    });

    _defineProperty(this, "started", false);

    _defineProperty(this, "stopped", false);

    this.options = _objectSpread({}, this.options, options);
    this.options.interval = parseInt(this.options.interval, 10);
    this.options.concurrent = parseInt(this.options.concurrent, 10); // Backward compatibility:

    if (options.concurrency) {
      this.options.concurrent = parseInt(options.concurrency, 10);
    }
  }
  /**
   * Starts the queue if it has not been started yet.
   *
   * @emits   start
   * @return  {void}
   * @access  public
   */


  start() {
    if (!this.started) {
      this.emit("start");
      this.stopped = false;
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


  stop() {
    this.emit("stop");
    this.stopped = true;
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


  finalize() {
    if (--this.currentlyHandled === 0 && this.isEmpty) {
      this.emit("end");
      this.stop(); // Finalize doesn't force queue to stop as `Queue.stop()` does. New tasks
      // should therefore be still resolved automatically if `options.start` was
      // set to `true` (see `Queue.enqueue`):

      this.stopped = false;
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


  dequeue() {
    const promises = [];
    this.tasks.forEach((promise, id) => {
      // Maximum amount of parallel concurrencies:
      if (this.currentlyHandled >= this.options.concurrent) {
        return;
      }

      this.currentlyHandled++;
      this.tasks.delete(id);
      promises.push(Promise.resolve(promise()));
    });
    return Promise.all(promises).then(values => {
      for (let output of values) this.emit("resolve", output);

      return values;
    }).catch(error => {
      this.emit("reject", error);
      return error;
    }).then(output => {
      this.finalize();
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


  enqueue(tasks) {
    if (Array.isArray(tasks)) {
      tasks.map(task => this.enqueue(task));
      return;
    }

    if (typeof tasks !== "function") {
      throw new Error(`You must provide a function, not ${typeof tasks}.`);
    } // Start the queue if the queue should resolve new tasks automatically and
    // the queue hasn't been forced to stop:


    if (this.options.start && !this.stopped) {
      this.start();
    }

    this.tasks.set(this.uniqueId++, tasks);
  }
  /**
   * @see     enqueue
   * @access  public
   */


  add(tasks) {
    this.enqueue(tasks);
  }
  /**
   * Removes all tasks from the queue.
   *
   * @return  {void}
   * @access  public
   */


  clear() {
    this.tasks.clear();
  }
  /**
   * Checks whether the queue is empty, i.e. there's no tasks.
   *
   * @type    {boolean}
   * @access  public
   */


  get isEmpty() {
    return this.tasks.size === 0;
  }

}

exports.default = Queue;
module.exports = exports.default;
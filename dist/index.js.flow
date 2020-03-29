// @flow
import EventEmitter from "events";

/**
 * A small and simple library for promise-based queues. It will execute enqueued
 * functions concurrently at a specified speed. When a task is being resolved or
 * rejected, an event is emitted.
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
export default class Queue extends EventEmitter {
  /**
   * A collection to store unresolved tasks. We use a Map here because V8 uses a
   * variant of hash tables that generally have O(1) complexity for retrieval
   * and lookup.
   *
   * @see     https://codereview.chromium.org/220293002/
   * @type    {Map}
   * @access  private
   */
  tasks: Map<number, Function> = new Map();

  /**
   * @type    {number}  Used to generate a unique id for each task
   * @access  private
   */
  uniqueId = 0;

  /**
   * @type    {number}
   * @access  private
   */
  lastRan: number;

  /**
   * @type    {TimeoutID}
   * @access  private
   */
  timeoutId: TimeoutID;

  /**
   * @type    {number}  Amount of tasks currently handled by the queue
   * @access  private
   */
  currentlyHandled = 0;

  /**
   * @type    {Object}  options
   * @type    {number}  options.concurrent  How many tasks should be executed in parallel
   * @type    {number}  options.interval    How often should new tasks be executed (in ms)
   * @type    {boolean} options.start       Whether it should automatically execute new tasks as soon as they are added
   * @access  public
   */
  options = {
    concurrent: 5,
    interval: 500,
    start: true,
  };

  /**
   * @type    {boolean} Whether the queue is running
   * @access  public
   */
  started = false;

  /**
   * @type    {boolean} Whether the queue has been forced to stop by calling `Queue.stop`
   * @access  public
   */
  stopped = false;

  /**
   * Initializes a new queue instance with provided options.
   *
   * @param   {Object}  options
   * @param   {number}  options.concurrent  How many tasks should be executed in parallel
   * @param   {number}  options.interval    How often should new tasks be executed (in ms)
   * @param   {boolean} options.start       Whether it should automatically execute new tasks as soon as they are added
   * @return  {Queue}
   */
  constructor(options: Object = {}) {
    super();

    this.options = { ...this.options, ...options };
    this.options.interval = parseInt(this.options.interval, 10);
    this.options.concurrent = parseInt(this.options.concurrent, 10);

    // Backward compatibility:
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
    if (!this.started && !this.isEmpty) {
      this.stopped = false;
      this.started = true;

      (async () => {
        while (!this.isEmpty && !this.stopped) {
          await this.execute();
        }
      })();

      this.emit("start");
    }
  }

  /**
   * Forces the queue to stop. New tasks will not be executed automatically even
   * if `options.start` was set to `true`.
   *
   * @emits   stop
   * @return  {void}
   * @access  public
   */
  stop() {
    this.stopped = true;
    this.started = false;

    clearTimeout(this.timeoutId);

    this.emit("stop");
  }

  /**
   * Goes to the next request and stops the loop if there are no requests left.
   *
   * @emits   end
   * @return  {void}
   * @access  private
   */
  finalize() {
    this.currentlyHandled -= 1;

    if (this.currentlyHandled === 0 && this.isEmpty) {
      this.emit("end");
      this.stop();

      // Finalize doesn't force queue to stop as `Queue.stop()` does. Therefore,
      // new tasks should be still resolved automatically if `options.start` was
      // set to `true` (see `Queue.enqueue`):
      this.stopped = false;
    }
  }

  /**
   * Executes _n_ concurrent (based od `options.concurrent`) promises from the
   * queue.
   *
   * @return  {Promise<any>}
   * @emits   resolve
   * @emits   reject
   * @emits   dequeue
   * @access  private
   */
  async execute() {
    const promises = [];

    this.tasks.forEach((promise, id) => {
      // Maximum amount of parallel tasks:
      if (this.currentlyHandled < this.options.concurrent) {
        this.currentlyHandled++;
        this.tasks.delete(id);

        promises.push(
          Promise.resolve(promise())
            .then((value) => {
              this.emit("resolve", value);
              return value;
            })
            .catch((error) => {
              this.emit("reject", error);
              return error;
            })
            .finally(() => {
              this.emit("dequeue");
              this.finalize();
            })
        );
      }
    });

    // Note: Promise.all will reject if any of the concurrent promises fail,
    // regardless if they are all finished yet! This is why we are emitting
    // events per task (and not per batch of tasks with respect to
    // `concurrent`):
    const output = await Promise.all(promises);

    return this.options.concurrent === 1 ? output[0] : output;
  }

  /**
   * Executes _n_ concurrent (based od `options.concurrent`) promises from the
   * queue.
   *
   * @return  {Promise<any>}
   * @emits   resolve
   * @emits   reject
   * @emits   dequeue
   * @access  public
   */
  dequeue() {
    const { interval } = this.options;

    return new Promise<*>((resolve, reject) => {
      if (!this.lastRan) {
        this.lastRan = -Date.now() + interval;
      }

      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.lastRan = Date.now();
        this.execute().then(resolve);
      }, interval - (Date.now() - this.lastRan));
    });
  }

  /**
   * Adds tasks to the queue.
   *
   * @param   {Function|Array}  tasks     Tasks to add to the queue
   * @throws  {Error}                     When task is not a function
   * @return  {void}
   * @access  public
   */
  enqueue(tasks: Function | Array<Function>) {
    if (Array.isArray(tasks)) {
      tasks.map((task) => this.enqueue(task));
      return;
    }

    if (typeof tasks !== "function") {
      throw new Error(`You must provide a function, not ${typeof tasks}.`);
    }

    this.tasks.set(this.uniqueId++, tasks);

    // Start the queue if the queue should resolve new tasks automatically and
    // hasn't been forced to stop:
    if (this.options.start && !this.stopped) {
      this.start();
    }
  }

  /**
   * @see     enqueue
   * @access  public
   */
  add(tasks: Function | Array<Function>) {
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

// @flow
import EventEmitter from "events";

/**
 * A small and simple library for promise-based queues. It will resolve enqueued
 * functions concurrently at a specified speed. When a task is being resolved or
 * rejected, an event will be emitted.
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
   */
  tasks: Map<number, Function> = new Map();

  /**
   * Used to generate unique id for each task.
   *
   * @type    {number}
   */
  unique: number = 0;

  /**
   * Amount of tasks currently handled by the Queue.
   *
   * @type    {number}
   */
  current: number = 0;

  /**
   * @type    {Object}
   */
  options: Object = {};

  /**
   * @type    {boolean}
   */
  started: boolean = false;

  /**
   * @type    {IntervalID}
   */
  interval: IntervalID;

  /**
   * Initializes a new Queue instance with provided options.
   *
   * @param   {Object}  options
   * @param   {number}  options.concurrent
   * @param   {number}  options.interval
   */
  constructor(options: Object = {}): void {
    super();

    this.options = {
      concurrent: 5,
      interval: 500,
      ...options
    };

    this.options.interval = parseInt(this.options.interval);
    this.options.concurrent = parseInt(this.options.concurrent);

    // Backward compatibility:
    if (options.concurrency) {
      this.options.concurrent = options.concurrency;
    }
  }

  /**
   * Starts the queue if it has not been started yet.
   *
   * @emits   start
   * @return  {void}
   * @access  public
   */
  start(): void {
    if (!this.started) {
      this.emit("start");

      this.started = true;
      this.interval = setInterval(() => this.dequeue(), this.options.interval);
    }
  }

  /**
   * Stops the queue.
   *
   * @emits   stop
   * @return  {void}
   * @access  public
   */
  stop(): void {
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
  finalize(): void {
    if (--this.current === 0 && this.isEmpty) {
      this.emit("end");
      this.stop();
    }
  }

  /**
   * Resolves n concurrent promises from the queue.
   *
   * @return  {void}
   * @emits   resolve
   * @emits   reject
   * @access  public
   */
  dequeue(): void {
    this.tasks.forEach((promise, id) => {
      // Maximum amount of parallel concurrencies:
      if (this.current + 1 > this.options.concurrent) {
        return;
      }

      this.current++;
      this.tasks.delete(id);

      Promise.resolve(promise())
        .then((...output) => {
          this.emit("resolve", ...output);
        })
        .catch(error => {
          this.emit("reject", error);
        })
        .then(() => {
          this.finalize();
        });
    });
  }

  /**
   * Adds a promise to the queue.
   *
   * @param   {Function}  promise Promise to add to the queue
   * @throws  {Error}             When promise is not a function
   * @return  {void}
   * @access  public
   */
  enqueue(promise: Function): void {
    if (typeof promise !== "function") {
      throw new Error(`You must provide a function, not ${typeof promise}.`);
    }

    this.tasks.set(this.unique++, promise);
  }

  /**
   * @see     enqueue
   * @access  public
   */
  add(promise: Function): void {
    this.enqueue(promise);
  }

  /**
   * Removes all tasks fromt the queue.
   *
   * @return  {void}
   * @access  public
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * Checks whether the queue is empty, i.e. there's no tasks.
   *
   * @type  {boolean}
   * @access  public
   */
  get isEmpty(): boolean {
    return this.tasks.size === 0;
  }
}

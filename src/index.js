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
   * A stack to store unresolved tasks.
   *
   * @type    {Map}
   */
  stack: Map<number, Function> = new Map();

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
   * Queue config.
   *
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

    // Default options:
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
   * @emits   tick
   * @emits   resolve
   * @emits   reject
   * @return  {void}
   * @access  public
   */
  start(): void {
    if (this.started) {
      return;
    }

    this.emit("start");

    this.started = true;
    this.interval = setInterval(() => this.dequeue(), this.options.interval);
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
  finalize(): void {
    if (--this.current === 0 && this.tasks.size === 0) {
      this.emit("end");
      this.stop();
    }
  }

  /**
   * Resolves n concurrent promises from the queue.
   *
   * @return  {void}
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
  add(promise: Function): void {
    if (typeof promise !== "function") {
      throw new Error(`You must provide a function, not ${typeof promise}.`);
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
  remove(key: number): boolean {
    return this.stack.delete(key);
  }

  /**
   * @see     add
   * @access  public
   */
  push(promise: Function): void {
    this.add(promise);
  }

  /**
   * @see     remove
   * @access  private
   */
  pop(key: number): boolean {
    return this.remove(key);
  }

  /**
   * @see     remove
   * @access  private
   */
  shift(key: number): boolean {
    return this.remove(key);
  }
}

// @flow
import EventEmitter from "events";

const State = {
  IDLE: 0,
  RUNNING: 1,
  STOPPED: 2,
};

type Options = {
  concurrent: number,
  interval: number,
  start: boolean,
};

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
  uniqueId: number = 0;

  /**
   * @type    {number}
   * @access  private
   */
  lastRan: number = 0;

  /**
   * @type    {TimeoutID}
   * @access  private
   */
  timeoutId: TimeoutID;

  /**
   * @type    {number}  Amount of tasks currently handled by the queue
   * @access  private
   */
  currentlyHandled: number = 0;

  /**
   * @type    {State}
   * @access  public
   */
  state: $Values<typeof State> = State.IDLE;

  /**
   * @type    {Object}  options
   * @type    {number}  options.concurrent  How many tasks should be executed in parallel
   * @type    {number}  options.interval    How often should new tasks be executed (in ms)
   * @type    {boolean} options.start       Whether it should automatically execute new tasks as soon as they are added
   * @access  public
   */
  options: Options = {
    concurrent: 5,
    interval: 500,
    start: true,
  };

  /**
   * Initializes a new queue instance with provided options.
   *
   * @param   {Object}  options
   * @param   {number}  options.concurrent  How many tasks should be executed in parallel
   * @param   {number}  options.interval    How often should new tasks be executed (in ms)
   * @param   {boolean} options.start       Whether it should automatically execute new tasks as soon as they are added
   * @return  {Queue}
   */
  constructor(options: Options = {}) {
    super();

    this.options = { ...this.options, ...options };
    this.options.interval = parseInt(this.options.interval, 10);
    this.options.concurrent = parseInt(this.options.concurrent, 10);
  }

  /**
   * Starts the queue if it has not been started yet.
   *
   * @emits   start
   * @return  {void}
   * @access  public
   */
  start(): void {
    if (this.state !== State.RUNNING && !this.isEmpty) {
      this.state = State.RUNNING;
      this.emit("start");

      (async () => {
        while (this.shouldRun) {
          await this.dequeue();
        }
      })();
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
  stop(): void {
    clearTimeout(this.timeoutId);

    this.state = State.STOPPED;
    this.emit("stop");
  }

  /**
   * Goes to the next request and stops the loop if there are no requests left.
   *
   * @emits   end
   * @return  {void}
   * @access  private
   */
  finalize(): void {
    this.currentlyHandled -= 1;

    if (this.currentlyHandled === 0 && this.isEmpty) {
      this.stop();

      // Finalize doesn't force queue to stop as `Queue.stop()` does. Therefore,
      // new tasks should be still resolved automatically if `options.start` was
      // set to `true` (see `Queue.enqueue`):
      this.state = State.IDLE;

      this.emit("end");
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
  async execute(): Promise<*> {
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
  dequeue(): Promise<*> {
    const { interval } = this.options;

    return new Promise<*>((resolve, reject) => {
      const timeout = Math.max(0, interval - (Date.now() - this.lastRan));

      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.lastRan = Date.now();
        this.execute().then(resolve);
      }, timeout);
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
  enqueue(tasks: Function | Array<Function>): void {
    if (Array.isArray(tasks)) {
      tasks.map((task) => this.enqueue(task));
      return;
    }

    if (typeof tasks !== "function") {
      throw new Error(`You must provide a function, not ${typeof tasks}.`);
    }

    this.uniqueId = (this.uniqueId + 1) % Number.MAX_SAFE_INTEGER;
    this.tasks.set(this.uniqueId, tasks);

    // Start the queue if the queue should resolve new tasks automatically and
    // hasn't been forced to stop:
    if (this.options.start && this.state !== State.STOPPED) {
      this.start();
    }
  }

  /**
   * @see     enqueue
   * @access  public
   */
  add(tasks: Function | Array<Function>): void {
    this.enqueue(tasks);
  }

  /**
   * Removes all tasks from the queue.
   *
   * @return  {void}
   * @access  public
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * Size of the queue.
   *
   * @type    {number}
   * @access  public
   */
  get size(): number {
    return this.tasks.size;
  }

  /**
   * Checks whether the queue is empty, i.e. there's no tasks.
   *
   * @type    {boolean}
   * @access  public
   */
  get isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Checks whether the queue is not empty and not stopped.
   *
   * @type    {boolean}
   * @access  public
   */
  get shouldRun(): boolean {
    return !this.isEmpty && this.state !== State.STOPPED;
  }
}

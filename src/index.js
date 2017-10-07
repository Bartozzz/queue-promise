import EventEmitter from "events";

/**
 *
 */
export default class Queue extends EventEmitter {
    /**
     * A collection to store unresolved promises in.
     *
     * @type    {Map}
     */
    collection = new Map;

    /**
     * Used to generate unique id for each promise.
     *
     * @type    {number}
     */
    unique = 0;

    /**
     * Amount of promises currently handled.
     *
     * @type    {number}
     */
    current = 0;

    /**
     * Whenever the queue has started.
     *
     * @type    {boolean}
     */
    started = false;

    /**
     * Queue interval.
     *
     * @type    {Interval}
     */
    interval = null;

    /**
     * Initializes a new Queue instance with provided options.
     *
     * @param   {object}    options
     * @param   {number}    options.concurrency how many promises can be
     *                                          handled at the same time
     * @param   {number}    options.interval    how often should new promises be
     *                                          handled (in ms)
     * @access  public
     */
    constructor(options = {}) {
        super();

        // Default options:
        this.options = {
            concurrency: 5,
            interval: 500,
            ...options,
        };
    }

    /**
     * Starts the queue if it has not been started yet.
     *
     * @emits   start
     * @emits   tick
     * @emits   request
     * @emits   error
     * @access  public
     */
    start() {
        if (this.started) {
            return;
        }

        this.emit("start");

        this.started = true;
        this.interval = setInterval(() => {
            this.emit("tick");

            this.collection.forEach((promise, id) => {
                // Maximum amount of parallel concurrencies:
                if (this.current + 1 > this.options.concurrency) {
                    return;
                }

                this.current++;
                this.remove(id);

                promise()
                    .then((...output) => {
                        this.emit("resolve", ...output);
                    })
                    .catch((error) => {
                        this.emit("reject", error);
                    })
                    .then(() => {
                        this.next();
                    });
            });
        }, parseInt(this.options.interval));
    }

    /**
     * Stops the queue.
     *
     * @emits   stop
     * @access  public
     */
    stop() {
        this.emit("stop");

        this.started = false;
        this.interval = clearInterval(this.interval);
    }

    /**
     * Goes to the next request and stops the loop if there is no requests left.
     *
     * @emits   end
     * @access  private
     */
    next() {
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
    add(promise) {
        if (Promise.resolve(promise) == promise) {
            throw new Error(
                `You must provide a valid Promise, not ${typeof promise}.`
            );
        }

        this.collection.set(this.unique++, promise);
    }

    /**
     * Removes a promise from the queue.
     *
     * @param   {number}    key     - Promise id
     * @return  {bool}
     */
    remove(key) {
        return this.collection.delete(key);
    }
}

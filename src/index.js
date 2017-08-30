import EventEmitter      from "event-emitter";
import RequestCollection from "./collection/requestCollection";

export default class Queue extends RequestCollection {
    /**
     * @type    {EventEmitter}
     */
    events = new EventEmitter;

    /**
     * @type    {number}
     */
    current = 0;

    /**
     * @type    {boolean}
     */
    started = false;

    /**
     * @type    {Interval}
     */
    interval = null;

    /**
     * @param   {object}    options
     * @param   {number}    options.concurrency - how many promises can be handled at the same time
     * @param   {number}    options.interval    - how often should new promises be handled (in ms)
     * @access  public
     */
    constructor( options = {} ) {
        super();

        this.options = {
            concurrency : 5,
            interval    : 500,
            ...options
        };
    }

    /**
     * Starts the queue.
     *
     * @emits   start
     * @emits   tick
     * @emits   request
     * @emits   error
     * @access  public
     */
    start() {
        if ( this.started ) {
            return;
        }

        this.events.emit( "start" );

        this.started  = true;
        this.interval = setInterval( () => {
            this.events.emit( "tick" );

            this.each( ( promise, id ) => {
                if ( this.current + 1 > this.options.concurrency ) {
                    return;
                }

                this.current++;
                this.remove( id );

                promise()
                    .then( ...output => {
                        this.events.emit( "resolve", ...output );
                    } )
                    .catch( error => {
                        this.events.emit( "reject", error );
                    } )
                    .then( () => {
                        this.next();
                    } )
            } );
        }, this.options.interval );
    }

    /**
     * Stops the queue.
     *
     * @emits   stop
     * @access  public
     */
    stop() {
        this.events.emit( "stop" );

        this.started  = false;
        this.interval = clearInterval( this.interval );
    }

    /**
     * Goes to the next request and stops the loop if there is no requests left.
     *
     * @emits   end
     * @access  private
     */
    next() {
        if ( --this.current === 0 && this.size === 0 ) {
            this.events.emit( "end" );
            this.stop();
        }
    }

    /**
     * Sets a `callback` for an `event`.
     *
     * @param   {string}    event       - event name
     * @param   {function}  callback    - event callback
     * @access  public
     */
    on( event, callback ) {
        this.events.on( event, callback );
    }
}

import EventEmitter from "events";

export default class Queue extends EventEmitter {
    /**
     * @type    {Map}
     */
    collection = new Map;

    /**
     * @type    {number}
     */
    unique = 0;

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

        this.emit( "start" );

        this.started  = true;
        this.interval = setInterval( () => {
            this.emit( "tick" );

            this.collection.forEach( ( promise, id ) => {
                if ( this.current + 1 > this.options.concurrency ) {
                    return;
                }

                this.current++;
                this.remove( id );

                promise()
                    .then( ( ...output ) => {
                        this.emit( "resolve", ...output );
                    } )
                    .catch( error => {
                        this.emit( "reject", error );
                    } )
                    .then( () => {
                        this.next();
                    } )
            } );
        }, parseInt( this.options.interval ) );
    }

    /**
     * Stops the queue.
     *
     * @emits   stop
     * @access  public
     */
    stop() {
        this.emit( "stop" );

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
        if ( --this.current === 0 && this.collection.size === 0 ) {
            this.emit( "end" );
            this.stop();
        }
    }

    add( promise ) {
        if ( Promise.resolve( promise ) == promise ) {
            throw new Error( `You must provide a valid Promise, not ${typeof promise}.` );
        }

        this.collection.set( this.unique++, promise );
    }

    remove( key ) {
        this.collection.delete( key );
    }
}

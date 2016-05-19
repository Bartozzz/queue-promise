"use strict";

const EventEmitter      = require( "event-emitter" );
const RequestCollection = require( "./collection/requestCollection" );

/**
 * Queue class for promises.
 *
 * @author    Łaniewski Bartosz <laniewski.bartozzz@gmail.com> (//laniewski.me)
 * @copyright Copyright (c) 2016 Łaniewski Bartosz
 * @license   MIT
 */

class Queue extends RequestCollection {
    /**
     * Create a new `Queue` instance with optionally injected options.
     *
     * @param   object  options
     * @param   int     options.concurrency
     * @param   int     options.interval
     * @access  public
     */
    constructor( options ) {
        super();

        this.options = Object.assign( {
            concurrency : 5,
            interval    : 500
        }, options );

        this.events   = new EventEmitter;
        this.current  = 0;
        this.started  = false;
        this.interval = null;
    }

    /**
     * Starts the queue.
     *
     * @emits   start|tick|request|error
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
                    .then( ( ...output ) => {
                        this.events.emit( "resolve", ...output );
                        this.next();
                    } )
                    .catch( ( error ) => {
                        this.events.emit( "reject", error );
                        this.next();
                    } );
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
     * @param   event       Event name
     * @param   callback    Event callback
     * @access  public
     */
    on( event, callback ) {
        this.events.on( event, callback );
    }
};

module.exports = Queue;

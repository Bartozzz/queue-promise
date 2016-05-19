"use strict";

const BasicCollection = require( "basic-collection" );

/**
 * Request collection.
 *
 * @author    Łaniewski Bartosz <laniewski.bartozzz@gmail.com> (//laniewski.me)
 * @copyright Copyright (c) 2016 Łaniewski Bartosz
 * @license   MIT
 */

class RequestCollection extends BasicCollection {
    /**
     * Create a new `Collection` instance with optionally injected parameters.
     *
     * @param   array   parameters
     * @access  public
     */
    constructor( parameters ) {
        super( parameters );

        this.index = 0;
    }

    /**
     * Set an attribute for the current collection.
     *
     * @param   function    request
     * @throws  Request must be a valid Promise function
     * @access  public
     */
    add( request ) {
        if ( typeof request !== "function" ) {
            throw new Error( `You must provide a valid function, not ${typeof request}.` );
        }

        super.set( this.index++, request );
    }
};

module.exports = RequestCollection;

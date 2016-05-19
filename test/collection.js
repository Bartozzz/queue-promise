"use strict";

let RequestCollection = require( "../src/collection/requestCollection" );
let assert            = require( "assert" );

let Collection = new RequestCollection;

describe( "Request collection", function () {
    describe( "#add()", function () {
        it( "should add and index promises", function () {
            Collection.add( () => new Promise( ( resolve, reject ) => {} ) );
            Collection.add( () => new Promise( ( resolve, reject ) => {} ) );
            Collection.add( () => new Promise( ( resolve, reject ) => {} ) );

            assert.equal( "function", typeof Collection.get( 0 ) );
            assert.equal( "function", typeof Collection.get( 1 ) );
            assert.equal( "function", typeof Collection.get( 2 ) );
        } );

        it( "should throw an error when the parameter is not a promise", function () {
            assert.throws( () => Collection.add( 113 ), Error );
            assert.throws( () => Collection.add( "a" ), Error );
            assert.throws( () => Collection.add( NaN ), Error );
            assert.throws( () => Collection.add( new Number ), Error );
            assert.throws( () => Collection.add( new String ), Error );
            assert.throws( () => Collection.add( new Promise ), Error );
        } );
    } );
} );

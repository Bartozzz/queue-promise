# queue-promise

[![Greenkeeper badge](https://badges.greenkeeper.io/Bartozzz/queue-promise.svg)](https://greenkeeper.io/)

> A simple and small library for promise-based queues.

## Installation

```bash
$ npm install queue-promise
```

This module uses several ECMAScript 2015 (ES6) features. You'll need the latest Node.js version in order to make it work correctly. You might need to run the script with the `--harmony` flag, for example:

```bash
$ node --harmony index.js
```

## Usage

```javascript
"use strict";

const Queue = require( "./src/index.js" );
const debug = ( msg, err ) => {
    return () => new Promise( ( resolve, reject ) => {
        if ( err ) reject( `Error: ${msg}` );
        resolve( `Success: ${msg}` );
    } );
};

const q = new Queue( {
    concurrency : 1,
    interval    : 2000
} );

q.on( "resolve", ...data => console.log( data ) );
q.on( "reject", error => console.error( error ) );

q.add( debug( "Index 0" ) );
q.add( debug( "Index 1", true ) );
q.add( debug( "Index 2", true ) );
q.add( debug( "Index 3" ) );

q.start();
```

Generated output:

```   
[ 'Success: Index 0' ]  < after 2s
Error: Index 1          < after 4s
Error: Index 2          < after 6s
[ 'Success: Index 3' ]  < after 8s
```

## API

#### new Queue( options )

Create a new `Queue` instance with optionally injected options.

| Option      | Default | Description                                   |
|:------------|:--------|:----------------------------------------------|
| concurrency | 10      | How many promises can be handled at the same time |
| interval    | 250     | How often should new promises be handled (in ms)  |

#### **public** .add( promise )

Adds a promise to the queue.

#### **public** .start()

Starts the queue.

#### **public** .stop()

Stops the queue.

#### **private** .next()

Goes to the next request and stops the loop if there is no requests left.

#### **public** .on( event, callback )

Sets a `callback` for an `event`. You can set callback for those events:
- `start`
- `stop`
- `tick`
- `resolve[ ...output ]`
- `reject[ message ]`
- `end`

## Tests

```bash
$ npm test
```

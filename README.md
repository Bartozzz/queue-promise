<div align="center">
  <h1>queue-promise</h1>

[![Greenkeeper badge](https://badges.greenkeeper.io/Bartozzz/queue-promise.svg)](https://greenkeeper.io/)
[![Build Status](https://img.shields.io/travis/Bartozzz/queue-promise.svg)](https://travis-ci.org/Bartozzz/queue-promise/)
[![npm version](https://img.shields.io/npm/v/queue-promise.svg)](https://www.npmjs.com/package/queue-promise)
[![npm downloads](https://img.shields.io/npm/dt/queue-promise.svg)](https://www.npmjs.com/package/queue-promise)
  <br>

A simple and small library for promise-based queues.
</div>

## Installation

```bash
$ npm install queue-promise
```

## Usage

```javascript
import Queue from "queue-promise";

const q = new Queue( {
    concurrency : 1,
    interval    : 2000
} );

q.on( "resolve", ...data => console.log( data ) );
q.on( "reject", error => console.error( error ) );

q.add( asyncTaskA ); // resolved/rejected after 0s
q.add( asyncTaskB ); // resolved/rejected after 2s
q.add( asyncTaskC ); // resolved/rejected after 4s
q.add( asyncTaskD ); // resolved/rejected after 6s
q.start();
```

## API

#### new Queue( options )

Create a new `Queue` instance with optionally injected options.

| Option      | Default | Description                                       |
|:------------|:--------|:--------------------------------------------------|
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

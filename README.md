<div align="center">
  <h1>queue-promise</h1>

[![Greenkeeper badge](https://badges.greenkeeper.io/Bartozzz/queue-promise.svg)](https://greenkeeper.io/)
[![Build Status](https://img.shields.io/travis/Bartozzz/queue-promise.svg)](https://travis-ci.org/Bartozzz/queue-promise/)
[![npm version](https://img.shields.io/npm/v/queue-promise.svg)](https://www.npmjs.com/package/queue-promise)
[![npm downloads](https://img.shields.io/npm/dt/queue-promise.svg)](https://www.npmjs.com/package/queue-promise)
<br>

`queue-promise` is a small, dependency-free library for promise-based queues. It will resolve enqueued functions concurrently at a given speed. When a task is being resolved or rejected, an event will be emitted.

</div>

## Installation

```bash
$ npm install queue-promise
```

## Usage

```javascript
import Queue from "queue-promise";

const queue = new Queue({
  concurrent: 1, // resolve 1 task at a time
  interval: 2000 // resolve a new task once in 2000ms
});

queue.on("resolve", data => console.log(data));
queue.on("reject", error => console.error(error));

queue.push(asyncTaskA); // resolved/rejected after 0s
queue.push(asyncTaskB); // resolved/rejected after 2s
queue.push(asyncTaskC); // resolved/rejected after 4s
queue.push(asyncTaskD); // resolved/rejected after 6s
queue.start();
```

## API

#### `new Queue(options)`

Create a new `Queue` instance.

| Option     | Default | Description                                    |
| :--------- | :------ | :--------------------------------------------- |
| concurrent | 5       | How many tasks can be handled at the same time |
| interval   | 500     | How often should new tasks be handled (in ms)  |

#### **public** `.add(task)`/`.push(task)`

Puts a new task on the stack. Throws an error if the provided `task` is not a valid function.

#### **public** `.start()`

Starts the queue. `Queue` will use global [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

#### **public** `.started`

Whether the queue has been started or not.

#### **public** `.stop()`

Stops the queue.

#### **public** `.on(event, callback)`

Sets a `callback` for an `event`. You can set callback for those events: `start`, `stop`, `tick`, `resolve`, `reject`, `end`.

#### **private** `.next()`

Goes to the next request and stops the loop if there is no requests left.

#### **private** `.remove(key)`/`.pop(key)`/`.shift(key)`

Removes a task from the queue.

## Tests

```bash
$ npm test
```

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
  concurrent: 1,  // resolve 1 task at a time
  interval: 2000, // resolve new tasks each 2000ms,
  start: true,    // automatically resolve new tasks when they are added
});

queue.on("resolve", data => console.log(data));
queue.on("reject", error => console.error(error));

queue.enqueue(asyncTaskA); // resolved/rejected after 0s
queue.enqueue(asyncTaskB); // resolved/rejected after 2s
queue.enqueue(asyncTaskC); // resolved/rejected after 4s
queue.enqueue(asyncTaskD); // resolved/rejected after 6s
```

## API

#### `new Queue(options)`

Create a new `Queue` instance.

| Option       | Default | Description                                                                  |
| :----------- | :------ | :--------------------------------------------------------------------------- |
| `concurrent` | `5`     | How many tasks can be handled at the same time                               |
| `interval`   | `500`   | How often should new tasks be handled (in ms)                                |
| `start`      | `true`  | Whether we should automatically resolve new tasks as soon as they are added  |

#### **public** `.enqueue(task)`/`.add(task)`

Puts a new task on the stack. Tasks should be an async function or return a promise. Throws an error if the provided `task` is not a valid function.

**Example:**

```javascript
async function getRepos(user) {
  return await github.getRepos(user);
};

queue.enqueue(getRepos("userA"));
queue.enqueue(getRepos("userB"));

// …equivalent to:
queue.enqueue([
  getRepos("userA"),
  getRepos("userB"),
]);
```

#### **public** `.dequeue()`

Resolves _n_ concurrent promises from the queue. Uses global [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

**Example:**

```javascript
queue.enqueue(getRepos("userA"));
queue.enqueue(getRepos("userB"));

// If "concurrent" is set to 1, only one promise is resolved on dequeue:
const userA = await queue.dequeue();
const userB = await queue.dequeue();

// If "concurrent" is set to 2, two promises are resolved concurrently:
const users = await queue.dequeue();
```

#### **public** `.on(event, callback)`

Sets a `callback` for an `event`. You can set callback for those events: `start`, `stop`, `resolve`, `reject`, `end`.

**Example:**

```javascript
queue.enqueue([…]);

queue.on("resolve", output => …);
queue.on("reject", output => …);
queue.on("end", () => …);
```

#### **public** `.start()`

Starts the queue – it will automatically dequeue tasks periodically. Emits `start` event.

#### **public** `.stop()`

Stops the queue. Emits `stop` event.

#### **public** `.clear()`

Removes all tasks from the queue.

#### **public** `.started`

Whether the queue has been started or not.

#### **public** `.isEmpty`

Whether the queue is empty, i.e. there's no tasks.

## Tests

```bash
$ npm test
```

<div align="center">
  <h1>queue-promise</h1>

[![Known Vulnerabilities](https://snyk.io/test/github/Bartozzz/queue-promise/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Bartozzz/queue-promise?targetFile=package.json)
[![Default CI/CD](https://github.com/Bartozzz/queue-promise/workflows/Default%20CI/CD/badge.svg)](https://github.com/Bartozzz/queue-promise/actions)
[![npm version](https://img.shields.io/npm/v/queue-promise.svg)](https://www.npmjs.com/package/queue-promise)
[![npm dependency Status](https://david-dm.org/Bartozzz/queue-promise.svg)](https://www.npmjs.com/package/queue-promise)
[![npm downloads](https://img.shields.io/npm/dt/queue-promise.svg)](https://www.npmjs.com/package/queue-promise)
<br>

`queue-promise` is a small, dependency-free library for promise-based queues. It will execute enqueued tasks concurrently at a given speed. When a task is being resolved or rejected, an event is emitted.

</div>

## Installation

```bash
$ npm install queue-promise
```

## Usage

```javascript
import Queue from "queue-promise";

const queue = new Queue({
  concurrent: 1,
  interval: 2000,
  start: true
});

queue.on("start", () => /* … */);
queue.on("stop", () => /* … */);
queue.on("end", () => /* … */);

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

| Option       | Default | Description                                                                 |
| :----------- | :------ | :-------------------------------------------------------------------------- |
| `concurrent` | `5`     | How many tasks should be executed in parallel                               |
| `interval`   | `500`   | How often should new tasks be executed (in ms)                              |
| `start`      | `true`  | Whether it should automatically execute new tasks as soon as they are added |

#### **public** `.enqueue(tasks)`/`.add(tasks)`

Adds a new task to the queue. A task should be an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) (ES2017) or return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Throws an error if the provided `task` is not a valid function.

**Example:**

```javascript
async function getRepos(user) {
  return await github.getRepos(user);
}

queue.enqueue(() => {
  return getRepos("userA");
});

queue.enqueue(async () => {
  await getRepos("userB");
});

// …equivalent to:
queue.enqueue([() => getRepos("userA"), () => getRepos("userB")]);
```

#### **public** `.dequeue()`

Executes _n_ concurrent (based od `options.concurrent`) promises from the queue. Uses global [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Is called automatically if `options.start` is set to `true`. Emits `resolve` and `reject` events.

**Example:**

```javascript
queue.enqueue(() => getRepos("userA"));
queue.enqueue(() => getRepos("userB"));

// If "concurrent" is set to 1, only one promise is executed on dequeue:
const userA = await queue.dequeue();
const userB = await queue.dequeue();

// If "concurrent" is set to 2, two promises are executed concurrently:
const [userA, userB] = await queue.dequeue();
```

#### **public** `.on(event, callback)`

Sets a `callback` for an `event`. You can set callback for those events: `start`, `stop`, `resolve`, `reject`, `dequeue`, `end`.

**Example:**

```javascript
queue.on("dequeue", () => …);
queue.on("resolve", data => …);
queue.on("reject", error => …);
queue.on("start", () => …);
queue.on("stop", () => …);
queue.on("end", () => …);
```

**Note:**

`dequeue`, `resolve` and `reject` events are emitted per task. This means that even if `concurrent` is set to `2`, `2` events will be emitted.

#### **public** `.start()`

Starts the queue – it will automatically dequeue tasks periodically. Emits `start` event.

```javascript
queue.enqueue(() => getRepos("userA"));
queue.enqueue(() => getRepos("userB"));
queue.enqueue(() => getRepos("userC"));
queue.enqueue(() => getRepos("userD"));
queue.start();

// No need to call `dequeue` – you can just listen for events:
queue.on("resolve", data => …);
queue.on("reject", error => …);
```

#### **public** `.stop()`

Forces the queue to stop. New tasks will not be executed automatically even if `options.start` was set to `true`. Emits `stop` event.

#### **public** `.clear()`

Removes all tasks from the queue.

#### **public** `.started`

Whether the queue is running.

#### **public** `.stopped`

Whether the queue has been forced to stop by calling `Queue.stop`.

#### **public** `.isEmpty`

Whether the queue is empty, i.e. there's no tasks.

## Tests

```bash
$ npm test
```

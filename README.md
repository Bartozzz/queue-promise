<div align="center">
  <h1>queue-promise</h1>

[![Default CI/CD](https://github.com/Bartozzz/queue-promise/workflows/Default%20CI/CD/badge.svg)](https://github.com/Bartozzz/queue-promise/actions)
[![Known Vulnerabilities](https://snyk.io/test/github/Bartozzz/queue-promise/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Bartozzz/queue-promise?targetFile=package.json)
[![npm package size](https://img.badgesize.io/Bartozzz/queue-promise/master/dist/index.js?compression=gzip)](https://www.npmjs.com/package/queue-promise)
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

### With automatic start

```javascript
import Queue from "queue-promise";

const queue = new Queue({
  concurrent: 1,
  interval: 2000
});

queue.on("start", () => /* … */);
queue.on("stop", () => /* … */);
queue.on("end", () => /* … */);

queue.on("resolve", data => console.log(data));
queue.on("reject", error => console.error(error));

queue.enqueue(asyncTaskA); // resolved/rejected after 0ms
queue.enqueue(asyncTaskB); // resolved/rejected after 2000ms
queue.enqueue(asyncTaskC); // resolved/rejected after 4000ms
```

### Without automatic start

```javascript
import Queue from "queue-promise";

const queue = new Queue({
  concurrent: 1,
  interval: 2000,
  start: false,
});

queue.enqueue(asyncTaskA);
queue.enqueue(asyncTaskB);
queue.enqueue(asyncTaskC);

while (queue.shouldRun) {
  // 1st iteration after 2000ms
  // 2nd iteration after 4000ms
  // 3rd iteration after 6000ms
  const data = await queue.dequeue();
}
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

**Note:**

`.dequeue()` function throttles (is executed at most once per every `options.interval` milliseconds).

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

#### **public** `.size`

Size of the queue.

#### **public** `.isEmpty`

Whether the queue is empty, i.e. there's no tasks.

#### **public** `.shouldRun`

Checks whether the queue is not empty and not stopped.

## Tests

```bash
$ npm test
```

## Contributing

### Development

We have prepared multiple commands to help you develop `queue-promise` on your own. You will need a local copy of [Node.js](https://nodejs.org/en/) installed on your machine. Then, install project dependencies using the following command:

```bash
$ npm install
```

#### Usage

```bash
$ npm run <command>
```

#### List of commands

| Command           | Description                                              |
| :---------------- | :------------------------------------------------------- |
| `test`            | Run all `test:*` commands described below.               |
| `test:flow`       | Test Flow types.                                         |
| `test:typescript` | Test TypeScript types.                                   |
| `test:unit`       | Run unit tests.                                          |
| `test:lint`       | Run linter tests.                                        |
| `defs:flow`       | Build Flow type definitions.                             |
| `defs:typescript` | Build TypeScript type definitions.                       |
| `clean`           | Clean `dist` directory.                                  |
| `build`           | Build package and generate type definitions.             |
| `watch`           | Build package in watch mode.                             |
| `release`         | Bump package version and generate a `CHANGELOG.md` file. |

### License

`queue-promise` was created and developed by [Bartosz Łaniewski](https://github.com/Bartozzz). The full list of contributors can be found [here](https://github.com/Bartozzz/queue-promise/graphs/contributors). The package is [MIT licensed](https://github.com/Bartozzz/queue-promise/blob/master/LICENSE).

### Bug reporting

[![Github Open Issues](https://img.shields.io/github/issues-raw/Bartozzz/queue-promise.svg)](https://github.com/Bartozzz/queue-promise/issues)
[![Github Closed Issues](https://img.shields.io/github/issues-closed-raw/Bartozzz/queue-promise.svg)](https://github.com/Bartozzz/queue-promise/issues?q=is%3Aissue+is%3Aclosed)
[![Github Pull Requests](https://img.shields.io/github/issues-pr-raw/Bartozzz/queue-promise.svg)](https://github.com/Bartozzz/queue-promise/pulls)

**We want contributing to `queue-promise` to be fun, enjoyable, and educational for anyone, and everyone.** Changes and improvements are more than welcome! Feel free to fork and open a pull request. We use [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. If you have found any issues, please [report them here](https://github.com/Bartozzz/queue-promise/new) - they are being tracked on [GitHub Issues](https://github.com/Bartozzz/queue-promise/issues).

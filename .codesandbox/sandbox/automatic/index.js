import Queue from "queue-promise";

function successTask(timeout = 500) {
  return new Promise((resolve, reject) => setTimeout(resolve, timeout));
}

function failureTask(timeout = 500) {
  return new Promise((resolve, reject) => setTimeout(reject, timeout));
}

const queue = new Queue({
  concurrent: 2,
  interval: 1000,
  start: true,
});

queue.on("start", () => {
  console.debug("Queue started");
});

queue.on("stop", () => {
  console.debug("Queue stopped");
});

queue.on("end", () => {
  console.debug("Queue finished");
});

queue.on("dequeue", () => {
  console.debug("Queue dequeued a task");
});

queue.on("resolve", (data) => {
  console.debug("Resolve", data);
});

queue.on("reject", (error) => {
  console.debug("Reject", error);
});

queue.enqueue(successTask);
queue.enqueue(successTask);
queue.enqueue(failureTask);
queue.enqueue(failureTask);

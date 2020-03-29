// Minimum TypeScript Version: 3.0
import { EventEmitter } from "events";

declare module "queue-promise" {
  type TaskFactory = () => Promise<any>;

  interface QueueOptions {
    concurrent?: number;
    interval?: number;
    start?: boolean;
  }

  class Queue extends EventEmitter {
    readonly options: QueueOptions;
    readonly started: boolean;
    readonly stopped: boolean;
    readonly isEmpty: boolean;

    constructor(options?: QueueOptions);

    start(): void;
    stop(): void;
    dequeue(): any;
    enqueue(tasks: TaskFactory | ReadonlyArray<TaskFactory>): void;
    add(tasks: TaskFactory | ReadonlyArray<TaskFactory>): void;
    clear(): void;
  }
}

export default Queue;

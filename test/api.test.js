import chai from "chai";
import { queueFactory, resolve, reject } from "./helpers";

describe("queue-promise (API tests)", () => {
  const expect = chai.expect;

  describe("start()", () => {
    it("should start only if the queue is not empty", (done) => {
      const queue = queueFactory();

      queue.start();
      expect(queue.started).to.be.false;

      queue.enqueue(resolve);
      queue.on("end", done);
      queue.start();
    });

    it("should automatically start the queue if `start = true`", (done) => {
      let queue = queueFactory({ start: true });

      queue.enqueue(resolve);
      queue.on("resolve", () => done());
    });
  });

  describe("stop()", () => {
    it("should stop the queue even if all tasks are not completed", (done) => {
      const queue = queueFactory({ concurrent: 1, interval: 1000 });

      queue.enqueue(resolve);
      queue.enqueue(resolve);
      queue.enqueue(resolve);

      queue.on("start", () => {
        queue.stop();
      });

      queue.on("stop", () => {
        expect(queue.tasks.size).to.not.equal(0);
        done();
      });

      queue.start();
    });

    it("should prevent the queue from autostarting when stopped manually", (done) => {
      const queue = queueFactory({ start: true });

      queue.on("start", () => {
        queue.stop();
      });

      queue.on("stop", () => {
        expect(queue.started).to.be.false;
        expect(queue.stopped).to.be.true;

        // If not stopped manually using `stop()`, the queue would automatically
        // resolve new enqueued task:
        queue.enqueue(resolve);

        expect(queue.started).to.be.false;
        expect(queue.stopped).to.be.true;

        done();
      });

      queue.enqueue(resolve);
    });
  });

  describe("execute()", () => {
    it("should resolve enqueued tasks", async () => {
      const queue = queueFactory();

      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(2);

      const a = await queue.dequeue();
      expect(a).to.equal("Error");
      expect(queue.tasks.size).to.equal(1);

      const b = await queue.dequeue();
      expect(b).to.equal("Success");
      expect(queue.tasks.size).to.equal(0);
    });

    it("should resolve multiple enqueued tasks (2 concurrent – 4 tasks)", async () => {
      const queue = queueFactory({
        concurrent: 2,
      });

      queue.enqueue(reject);
      queue.enqueue(resolve);
      queue.enqueue(resolve);
      queue.enqueue(reject);

      expect(queue.tasks.size).to.equal(4);

      const a = await queue.dequeue();
      expect(a).to.eql(["Error", "Success"]);
      expect(queue.tasks.size).to.equal(2);

      const b = await queue.dequeue();
      expect(b).to.eql(["Success", "Error"]);
      expect(queue.tasks.size).to.equal(0);
    });

    it("should resolve multiple enqueued tasks (2 concurrent – 3 tasks)", async () => {
      const queue = queueFactory({
        concurrent: 2,
      });

      queue.enqueue(reject);
      queue.enqueue(resolve);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(3);

      const a = await queue.dequeue();
      expect(a).to.eql(["Error", "Success"]);
      expect(queue.tasks.size).to.equal(1);

      const b = await queue.dequeue();
      expect(b).to.eql(["Success"]);
      expect(queue.tasks.size).to.equal(0);
    });
  });

  describe("enqueue(asyncTask)", () => {
    it("should add a new task if valid", () => {
      const queue = queueFactory();

      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(2);
    });

    it("should add an array of tasks if valid", () => {
      const queue = queueFactory();

      queue.enqueue([resolve, reject]);
      queue.enqueue([resolve, reject]);

      expect(queue.tasks.size).to.equal(4);
    });

    it("should reject a new task if not valid", () => {
      const queue = queueFactory();

      try {
        expect(queue.enqueue(true)).to.throw();
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
      }

      queue.clear();
    });
  });

  describe("dequeue()", () => {
    it("should be throttling between successive executions", async () => {
      const start = Date.now();
      const interval = 100;
      const queue = queueFactory({ interval });

      queue.enqueue([resolve, resolve, resolve]);

      const task1 = await queue.dequeue();
      expect(Date.now() - start).to.be.closeTo(interval * 0, interval / 5);

      const task2 = await queue.dequeue();
      expect(Date.now() - start).to.be.closeTo(interval * 1, interval / 5);

      const task3 = await queue.dequeue();
      expect(Date.now() - start).to.be.closeTo(interval * 2, interval / 5);
    });
  });

  describe("clear()", () => {
    it("should remove enqueued tasks", () => {
      const queue = queueFactory();

      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.isEmpty).to.be.false;
      expect(queue.tasks.size).to.equal(2);

      queue.clear();

      expect(queue.isEmpty).to.be.true;
      expect(queue.tasks.size).to.equal(0);
    });
  });

  describe("isEmpty", () => {
    it("should return 'true' when queue is empty", () => {
      const queue = queueFactory();

      expect(queue.isEmpty).to.be.true;
    });

    it("should return 'false' when queue is not empty", () => {
      const queue = queueFactory();

      queue.enqueue(resolve);
      queue.enqueue(reject);

      expect(queue.isEmpty).to.be.false;
    });
  });

  describe("on(event, callback)", () => {
    describe("Event: start", () => {
      it("should emit 'start' event when the queue hasn't started yet and isn't empty", (done) => {
        let queue = queueFactory();

        queue.enqueue(reject);
        queue.enqueue(resolve);
        queue.on("start", done);

        queue.start();
      });

      it("should NOT emit 'start' event when the queue has already started", (done) => {
        let queue = queueFactory();
        let count = 0;

        queue.enqueue(resolve);
        queue.enqueue(resolve);
        queue.enqueue(resolve);

        queue.on("start", () => {
          count++;
        });

        queue.start();
        queue.start();
        queue.start();

        if (count > 1) {
          done(new Error("Started more than once"));
        } else {
          done();
        }
      });

      it("should NOT emit 'start' event when the queue isEmpty", (done) => {
        let queue = queueFactory();
        let count = 0;

        queue.on("start", () => {
          count++;
        });

        queue.start();

        if (count > 0) {
          done(new Error("Started even if empty"));
        } else {
          done();
        }
      });
    });

    describe("Event: stop", () => {
      it("should emit 'stop' event when the queue is stopped manually", (done) => {
        let queue = queueFactory();

        queue.on("stop", done);

        queue.stop();
      });

      it("should emit 'stop' event when the queue finished resolving all tasks", (done) => {
        let queue = queueFactory();

        queue.enqueue(resolve);
        queue.enqueue(resolve);
        queue.on("stop", done);

        queue.start();
      });
    });

    describe("Event: end", () => {
      it("should emit 'end' event when the queue finished resolving all tasks", (done) => {
        let queue = queueFactory();

        queue.enqueue(resolve);
        queue.enqueue(resolve);
        queue.on("end", done);

        queue.start();
      });
    });

    describe("Event: dequeue", () => {
      it("should emit 'dequeue' event when the tasks completes (resolves or rejects)", (done) => {
        let queue = queueFactory();
        let count = 0;

        queue.enqueue(resolve);
        queue.enqueue(reject);

        queue.on("dequeue", () => {
          count += 1;

          if (count === 2) {
            done();
          }
        });

        queue.start();
      });

      it("should emit 'dequeue' event on concurrent eval", (done) => {
        let count = 2;
        let queue = queueFactory({ concurrent: 2 });

        queue.enqueue(reject);
        queue.enqueue(resolve);
        queue.on("dequeue", () => {
          count -= 1;

          if (!count) {
            done();
          }
        });

        queue.start();
      });
    });

    describe("Event: resolve", () => {
      it("should emit 'resolve' event when the tasks resolve", (done) => {
        let queue = queueFactory();

        queue.enqueue(resolve);
        queue.enqueue(reject);

        queue.on("resolve", (message) => {
          expect(message).to.equal("Success");
        });

        queue.on("end", () => {
          done();
        });

        queue.start();
      });

      it("should emit 'resolve' event on concurrent eval", (done) => {
        let count = 2;
        let queue = queueFactory({ concurrent: 2 });

        queue.enqueue(resolve);
        queue.enqueue(resolve);

        queue.on("resolve", () => {
          count -= 1;

          if (!count) {
            done();
          }
        });

        queue.start();
      });
    });

    describe("Event: reject", () => {
      it("should emit 'reject' event when the tasks reject", (done) => {
        let queue = queueFactory();

        queue.enqueue(resolve);
        queue.enqueue(reject);

        queue.on("reject", (message) => {
          expect(message).to.equal("Error");
        });

        queue.on("end", () => {
          done();
        });

        queue.start();
      });

      it("should emit 'reject' event on concurrent eval", (done) => {
        let count = 2;
        let queue = queueFactory({ concurrent: 2 });

        queue.enqueue(reject);
        queue.enqueue(reject);

        queue.on("reject", () => {
          count -= 1;

          if (!count) {
            done();
          }
        });

        queue.start();
      });
    });
  });
});

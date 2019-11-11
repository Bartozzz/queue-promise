import chai from "chai";
import { queueFactory, resolve, reject } from "./helpers";

describe("queue-promise (API tests)", function() {
  const expect = chai.expect;

  describe("enqueue(asyncTask)", function() {
    it("should add a new task if valid", function() {
      const queue = queueFactory();

      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(2);
    });

    it("should add an array of tasks if valid", function() {
      const queue = queueFactory();

      queue.enqueue([resolve, reject]);
      queue.enqueue([resolve, reject]);

      expect(queue.tasks.size).to.equal(4);
    });

    it("should reject a new task if not valid", function() {
      const queue = queueFactory();

      try {
        expect(queue.enqueue(true)).to.throw();
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal(
          "You must provide a function, not boolean."
        );
      }

      queue.clear();
    });
  });

  describe("clear()", function() {
    it("should remove enqueued tasks", function() {
      const queue = queueFactory();

      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.isEmpty).to.equal(false);
      expect(queue.tasks.size).to.equal(2);

      queue.clear();

      expect(queue.isEmpty).to.equal(true);
      expect(queue.tasks.size).to.equal(0);
    });
  });

  describe("dequeue()", function() {
    it("should resolve enqueued tasks", async function() {
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

    it("should resolve multiple enqueued tasks (2 concurrent – 4 tasks)", async function() {
      const queue = queueFactory({
        concurrent: 2
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

    it("should resolve multiple enqueued tasks (2 concurrent – 3 tasks)", async function() {
      const queue = queueFactory({
        concurrent: 2
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

  describe("start()", function() {
    it("should start only if the queue is not empty", function(done) {
      const queue = queueFactory();

      queue.start();
      expect(queue.started).to.equal(false);

      queue.enqueue(resolve);
      queue.on("end", done);
      queue.start();
    });
  });

  describe("on(event, callback)", function() {
    it("should emit 'start' and 'end' events", function(done) {
      let hasStarted = false;
      let queue = queueFactory({ interval: 150 });

      queue.on("start", () => {
        hasStarted = true;
      });

      queue.on("end", () => {
        expect(hasStarted).to.equal(true);
        done();
      });

      queue.enqueue(resolve);
      queue.start();
    });

    it("should emit 'resolve' events", function(done) {
      let count = 3;
      let queue = queueFactory({ interval: 150 });

      queue.on("resolve", data => (count -= 1));
      queue.on("end", () => {
        expect(count).to.equal(0);
        done();
      });

      for (let i = count; i !== 0; i--) {
        queue.enqueue(resolve);
      }

      queue.start();
    });

    it("should emit 'reject' events", function(done) {
      let count = 3;
      let queue = queueFactory({ interval: 150 });

      queue.on("reject", data => (count -= 1));
      queue.on("end", () => {
        expect(count).to.equal(0);
        done();
      });

      for (let i = count; i !== 0; i--) {
        queue.enqueue(reject);
      }

      queue.start();
    });
  });
});

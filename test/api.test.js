import chai from "chai";
import Queue from "../src";
import { resolve, reject } from "./helpers";

describe("queue-promise (API tests)", function() {
  const expect = chai.expect;

  let count = 0;
  let queue = new Queue({
    concurrency: 1,
    interval: 500,
    start: false
  });

  describe("enqueue(asyncTask)", function() {
    it("should add a new task if valid", function() {
      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(2);

      queue.clear();
    });

    it("should add an array of tasks if valid", function() {
      queue.enqueue([resolve, reject]);
      queue.enqueue([resolve, reject]);

      expect(queue.tasks.size).to.equal(4);

      queue.clear();
    });

    it("should reject a new task if not valid", function() {
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
      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(2);
      await queue.dequeue();
      expect(queue.tasks.size).to.equal(1);
      await queue.dequeue();
      expect(queue.tasks.size).to.equal(0);

      queue.clear();
    });
  });

  describe("on(event, callback)", function() {
    it("should handle events", function(done) {
      queue.on("resolve", data => (count += 1));
      queue.on("reject", error => (count += 1));
      queue.on("end", () => {
        expect(count).to.equal(2);
        done();
      });

      queue.clear();
      queue.enqueue(reject);
      queue.enqueue(resolve);
      queue.start();
    });
  });
});

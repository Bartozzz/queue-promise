import chai  from "chai";
import Queue from "../src/";

describe("queue-promise", function () {
  const expect = chai.expect;

  let count = 0;
  let queue = new Queue({
    concurrency: 1,
    interval: 500,
    start: false,
  });

  const reject = () => new Promise((resolve, reject) => reject("Error"));
  const resolve = () => new Promise((resolve, reject) => resolve("Success"));

  describe("enqueue(asyncTask)", function () {
    it("should add a new task if valid", function () {
      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(2);
    });

    it("should add an array of tasks if valid", function () {
      queue.enqueue([resolve, reject]);
      queue.enqueue([resolve, reject]);

      expect(queue.tasks.size).to.equal(6);
    });

    it("should reject a new task if not valid", function () {
      try {
        expect(queue.enqueue(true)).to.throw();
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal("You must provide a function, not boolean.");
      }
    });
  });

  describe("clear()", function () {
    it("should remove enqueued tasks", function () {
      queue.clear();

      expect(queue.isEmpty).to.equal(true);
      expect(queue.tasks.size).to.equal(0);
    });
  });

  describe("dequeue()", function () {
    it("should resolve enqueued tasks", async function () {
      queue.clear();
      queue.enqueue(reject);
      queue.enqueue(resolve);

      expect(queue.tasks.size).to.equal(2);
      await queue.dequeue();
      expect(queue.tasks.size).to.equal(1);
      await queue.dequeue();
      expect(queue.tasks.size).to.equal(0);
    });
  });

  describe("on(event, callback)", function () {
    it("should handle events", function (done) {
      queue.on("resolve", data => count += 1);
      queue.on("reject", error => count += 1);
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

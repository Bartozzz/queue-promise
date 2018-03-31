import chai  from "chai";
import Queue from "../src/";

describe("queue-promise", function () {
  const expect = chai.expect;

  let count = 0;
  let queue = new Queue({
    concurrency: 1,
    interval: 500
  });

  const reject = () => new Promise((resolve, reject) => reject("Error"));
  const resolve = () => new Promise((resolve, reject) => resolve("Success"));

  describe("add(asyncTask)", function () {
    it("should add a new task if valid", function () {
      queue.add(reject);
      queue.add(resolve);

      expect(queue.stack.size).to.equal(2);
    });

    it("should reject a new task if not valid", function () {
      try {
        expect(queue.add(true)).to.throw();
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal("You must provide a function, not boolean.");
      }
    });
  });

  describe("remove(key)", function () {
    it("should remove a registered task", function () {
      queue.remove(0);
      queue.remove(1);

      expect(queue.stack.size).to.equal(0);
    });
  });

  describe("on(event, callback)", function () {
    it("should handle events", function () {
      queue.on("resolve", function(data){count += 1});
      queue.on("reject", function(error){count += 1});
    });
  });

  describe("start()", function () {
    it("should handle events", function (done) {
      queue.add(reject);
      queue.add(resolve);
      queue.start();

      setTimeout(function () {
        expect(count).to.equal(2);
        done();
      }, 1250);
    });
  });
});

import chai from "chai";
import { queueFactory, resolve, reject } from "./helpers";

describe("queue-promise (Auto start)", function() {
  const expect = chai.expect;

  describe("enqueue(asyncTask)", function() {
    it("should automatically start the queue if `start = true`", function(done) {
      let queue = queueFactory({ start: true });

      queue.enqueue(resolve);
      queue.on("resolve", () => done());
    });
  });
});

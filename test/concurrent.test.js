import chai from "chai";
import Queue from "../src";
import { resolve, reject } from "./helpers";

describe("queue-promise (Concurrent tests)", function() {
  const expect = chai.expect;

  let queue = new Queue({
    concurrency: 2,
    interval: 500,
    start: false
  });

  describe("enqueue(asyncTask)", function() {
    it("it should resolve or reject all promises on concurrent eval", function(done) {
      let count = 2;

      const callback = () => {
        count -= 1;

        if (!count) {
          done();
        }
      };

      queue.clear();
      queue.enqueue(reject);
      queue.enqueue(resolve);

      queue.on("reject", callback);
      queue.on("resolve", callback);

      queue.start();
    });
  });
});

import chai from "chai";
import { queueFactory, resolve, reject } from "./helpers";

describe("queue-promise (Concurrent tests)", function() {
  const expect = chai.expect;

  describe("enqueue(asyncTask)", function() {
    it("should resolve or reject all promises on concurrent eval", function(done) {
      let count = 2;
      let queue = queueFactory({ concurrency: 2 });

      const callback = () => {
        count -= 1;

        if (!count) {
          done();
        }
      };

      queue.enqueue(reject);
      queue.enqueue(resolve);

      queue.on("reject", callback);
      queue.on("resolve", callback);

      queue.start();
    });
  });
});

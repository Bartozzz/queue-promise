import chai  from "chai";
import Queue from "../src/";

describe("queue-promise", function () {
  const expect = chai.expect;

  let count = 0;
  let queue = new Queue({
    concurrency: 2,
    interval: 1,
    start: false,
  });

  const reject = () => new Promise((resolve, reject) => reject("Error"));
  const resolve = () => new Promise((resolve, reject) => resolve("Success"));

  describe("enqueue(asyncTask)", function () {

    it("it should resolve or reject all promises on concurrent eval", function (done) {
      var c = 2;
      queue.enqueue(reject);
      queue.enqueue(resolve);
      queue.on("resolve", data => { console.log("Resolve",c); c-=1; if (!count) done(); });
      queue.start();
    });


  });
});

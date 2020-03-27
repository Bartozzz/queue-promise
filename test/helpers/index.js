import Queue from "../../dist";

export const queueFactory = (options = {}) => {
  return new Queue({
    concurrent: 1,
    interval: 10,
    start: false,
    ...options,
  });
};

export const reject = () => {
  return new Promise((_, reject) => reject("Error"));
};

export const resolve = () => {
  return new Promise((resolve, _) => resolve("Success"));
};

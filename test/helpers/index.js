export const reject = () => {
  return new Promise((_, reject) => reject("Error"));
};

export const resolve = () => {
  return new Promise((resolve, _) => resolve("Success"));
};

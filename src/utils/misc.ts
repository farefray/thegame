export function delayLoop (fn, delay = 1000) {
  return (x, i) => {
    setTimeout(() => {
      fn(x);
    }, i * delay);
  }
};

export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
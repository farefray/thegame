export function randomProperty(obj) {
  const keys = Object.keys(obj);
  // tslint:disable-next-line: no-bitwise
  return obj[keys[(keys.length * Math.random()) << 0]];
};
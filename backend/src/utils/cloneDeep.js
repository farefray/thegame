function cloneDeep(val) {
  switch (typeof val) {
    case 'object':
      return cloneObjectDeep(val);
    case 'array':
      return cloneArrayDeep(val);
    default: {
      return val;
    }
  }
}

function cloneObjectDeep(val) {
  /**
   * ! thats quite bad way, but works for BattleUnit cloning
   * ? investigate some other cloning technique?
   */
  const res = new val.constructor(val);
  for (let key in val) {
    res[key] = cloneDeep(val[key]);
  }

  return res;
}

function cloneArrayDeep(val) {
  const res = new val.constructor(val.length);
  for (let i = 0; i < val.length; i++) {
    res[i] = cloneDeep(val[i]);
  }

  return res;
}

export default cloneDeep;

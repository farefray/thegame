function cloneDeep(val) {
  if (Array.isArray(val)) {
    return cloneArrayDeep(val);
  }

  if (typeof val === 'object') {
    return cloneObjectDeep(val);
  }

  return val;
}

function cloneObjectDeep(val) {
  /**
   * ! thats quite bad way, but works for BattleUnit cloning
   * ? investigate some other cloning technique?
   */
  const res = new val.constructor(val);
  for (const key in val) {
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

export function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

export function almostEqual(a, b, absoluteError = 0.1, relativeError = 0.2) {
  const d = Math.abs(a - b);

  if (d <= absoluteError) {
    return true;
  }

  if (d <= relativeError * Math.min(Math.abs(a), Math.abs(b))) {
    return true;
  }

  return a === b;
}
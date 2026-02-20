export function shortenNumRu(value: number, precision: number = 1): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError("Value must be a finite number");
  }

  const abs = Math.abs(value);

  const UNITS = [
    { limit: 1e12, suffix: " трлн" },
    { limit: 1e9, suffix: " млрд" },
    { limit: 1e6, suffix: " млн" },
    { limit: 1e3, suffix: " тыс." },
  ];

  for (const { limit, suffix } of UNITS) {
    if (abs >= limit) {
      const short = (value / limit).toFixed(precision);
      return `${removeTrailingZero(short)}${suffix}`;
    }
  }

  return value.toString();
}

function removeTrailingZero(num: string): string {
  return num.replace(/\.0$/, "");
}

export const isEven = (n) => n % 2 === 0;

export const baseLog = (base, value) => Math.log(value) / Math.log(base);

export const log2 = (x) => baseLog(2, x);

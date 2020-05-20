/* eslint-disable @typescript-eslint/explicit-function-return-type */

import expressRateLimit from 'express-rate-limit';

export const milliseconds = (x: number) => x;
export const seconds = (x: number) => x * milliseconds(1000);
export const minutes = (x: number) => x * seconds(60);
export const hours = (x: number) => x * minutes(60);
export const days = (x: number) => x * hours(24);
export const weeks = (x: number) => x * days(7);
export const years = (x: number) => x * weeks(52);

export function limit(
  { window, every }: { window: number; every: number },
): expressRateLimit.Options {
  return {
    windowMs: window,
    max: window / every,
  };
}

export const assertNever = (value: never, label = 'variant'): never => {
  throw new TypeError(`Unhandled ${label}: ${JSON.stringify(value)}`);
};

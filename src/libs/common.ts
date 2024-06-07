export const createDebounce = () => {
  let timeoutId = null;
  return (fn: Function, t: number) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn();
    }, t);
  };
};

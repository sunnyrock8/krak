export const wait = (duration: number) => {
  return new Promise((res) => {
    setTimeout(res, duration);
  });
};

export const wait = async (time = 0) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

export async function sleep(delay: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, delay * 1000);
  });
}

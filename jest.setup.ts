afterAll(async () => {
  // eslint-disable-next-line no-underscore-dangle
  const app = (global as any).__APP__; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (app && app.close) {
    await app.close(); // Gracefully shutdown app instance if applicable
  }
});

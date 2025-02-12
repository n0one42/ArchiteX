export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.USE_MOCKS) {
    const { server } = await import("./mocks/node");
    console.log("Using mocks");
    server.listen();
  }
}

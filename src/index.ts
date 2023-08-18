import app from "./app";

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 8000;

app.listen({ port: FASTIFY_PORT, host: "0.0.0.0" }).finally(() => {
  //   if (err) throw err;

  // Check if connection to MySQL database was successful
  app.mysql.query("SELECT 1", (err: any, _result: any) => {
    if (err) {
      console.log("Error connecting to database:", err.message);
    } else {
      console.log("Successfully connected to database");
    }
  });
});

console.log(`🚀  Fastify server running on port ${FASTIFY_PORT}`);

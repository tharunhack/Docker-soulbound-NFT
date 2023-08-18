import fastify from "fastify";
import fastifyMysql from "@fastify/mysql";
import dotenv from "dotenv";
import router from "./router";

dotenv.config();
const server = fastify({
  // Logger only for production
  // logger: !!(process.env.NODE_ENV !== "development"),
  logger: false,
});

server.register(router);
try {
  server
    .register(fastifyMysql, {
      connectionString: process.env.DB_CONNECTION_URL as string,
    })
    .then(() => {
      console.log("mysql plugin loaded successfully");
    });
} catch (e) {
  console.log("db conn err", e);
}

// Middleware: Router

export default server;

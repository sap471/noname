import createFastify from "fastify";
import fastifySensible from "@fastify/sensible";
import fastifyCors from "@fastify/cors";

export default function createApp() {
  const app = createFastify({});
  
  app.register(fastifySensible);
  app.register(fastifyCors);

  // app.register(fastifyAutoload, {
  //   dir: __dirname + "/routes",
  //   scriptPattern: /.*\.route\.(ts|js|cjs|mjs)$/,
  // });

  return app;
}

import { FastifyPluginCallback } from "fastify";

export default <FastifyPluginCallback>function (fastify, options, done) {
  fastify.get("/", async (req, res) => ({
    message: "HELLO WORLD",
    yourIp: req.headers["x-forwarded-for"],
    method: req.method,
    headers: req.headers,
    body: req.body,
  }));

  done();
};

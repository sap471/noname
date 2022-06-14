import { FastifyPluginCallback } from 'fastify'

export default <FastifyPluginCallback>function (fastify, options, done) {
  fastify.get('/', async (req, res) => ({
    message: 'HELLO WORLD',
    yourIp: req.headers['x-forwarded-for'],
    method: req.method,
    headers: req.headers,
    body: req.body,
  }))

  fastify.get('/checkhealth', async (req, res) => {
    return res.status(200).send({ message: 'ok' })
  })

  done()
}

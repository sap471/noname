import { FastifyPluginCallback } from 'fastify'

export default <FastifyPluginCallback>function (fastify, options, done) {
  fastify.get('/', async (req, res) => ({
    message: 'Halo Manusia',
    statusCode: res.statusCode,
    ip: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip,
    method: req.method,
    body: req.body,
    userAgent: req.headers['user-agent'],
  }))

  fastify.get('/checkhealth', async (req, res) => {
    return res.status(200).send({ message: 'ok' })
  })

  done()
}

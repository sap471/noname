import { FastifyPluginAsync } from 'fastify'
import qrcode from 'qrcode'

export const autoPrefix: string = '/qrcode'

export default <FastifyPluginAsync>async function (fastify, options) {
  fastify.get<{
    Querystring: {
      txt: string
      width: number
      margin: number
    }
  }>('/create', async (req, reply) => {
    let { txt, width, margin } = req.query

    if (width >= 1500) width = 1500
    if (width <= 200) width = 200

    if (margin <= 0 || margin == undefined) margin = 1

    const result = await qrcode.toBuffer(txt, { width, margin })

    reply.header('Content-Length', result.length)
    // reply.header('Content-Disposition', `attachment; filename="${req.id}.png"`)
    reply.type('image/png')
    reply.send(result)
  })
}

import { JSONSchemaType } from 'ajv'
import { FastifyPluginAsync } from 'fastify'
import qrcode from 'qrcode'

interface createQRCodeArgs {
  txt: string
  width: number
  margin: number
  download: boolean
}

export const autoPrefix: string = '/qrcode'

export default <FastifyPluginAsync>async function (fastify) {
  fastify.get<{
    Querystring: createQRCodeArgs
  }>(
    '/create',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            txt: { type: 'string' },
            width: { type: 'number', minimum: 150, maximum: 2000, default: 150 },
            margin: { type: 'number', default: 1 },
            download: { type: 'boolean', default: false },
          },
          required: ['txt'],
          additionalProperties: false,
        } as JSONSchemaType<createQRCodeArgs>,
      },
      preHandler: fastify.rateLimit({
        max: 10,
        timeWindow: '1 minute',
      }),
    },
    async (req, reply) => {
      const { width, margin, download, txt } = req.query

      const result = await qrcode.toBuffer(txt, { width, margin })

      if (download) reply.header('Content-Disposition', `attachment; filename="${req.id}.png"`)
      reply.header('Content-Length', result.length)
      reply.type('image/png')

      reply.send(result)
    },
  )
}

import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'

const getRandomColor = (): string => {
  var letters = '0123456789abcdef'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export default <FastifyPluginAsyncTypebox>async function (fastify, options) {
  fastify.get<{
    Params: {
      text: string
    }
    Querystring: {
      size: number
      shape: string
    }
  }>(
    '/:text',
    {
      schema: {
        params: Type.Object({
          text: Type.String({ default: 'Administrator' }),
        }),
        querystring: Type.Object({
          size: Type.Number(),
          shape: Type.Optional(Type.String()),
        }),
      },
    },
    async (req, reply) => {
      const { text } = req.params
      const { size, shape } = req.query

      let colorOne = getRandomColor()
      let colorTwo = getRandomColor()
      let fontSize = (size * 0.9) / text.length

      const avatar = `<?xml version="1.0" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  <svg ${shape} width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g>
      <defs>
        <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorOne}"/>
          <stop offset="100%" stop-color="${colorTwo}"/>
        </linearGradient>
      </defs>
      <rect fill="url(#avatar)" x="0" y="0" width="${size}" height="${size}"/>
      <text x="50%" y="50%" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="${fontSize}">${text}</text>
    </g>
  </svg>`

      reply.header('Content-Type', 'image/svg+xml; charset=utf8')
      return reply.send(avatar)
    },
  )
}

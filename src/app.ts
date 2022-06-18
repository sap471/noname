import createFastify from 'fastify'
import fastifySensible from '@fastify/sensible'
import fastifyCors from '@fastify/cors'
import { v4 } from 'uuid'
import fastifyAutoload from '@fastify/autoload'
import { isProd } from './utils'
import fastifyHelmet from '@fastify/helmet'

declare module 'fastify' {
  interface FastifyInstance {}
}

export async function createApp() {
  const app = createFastify({
    logger: {
      // @ts-ignore
      redact: ['req.headers.authorization'],
      level: 'info',
      transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
    },
    genReqId: () => v4(),
    trustProxy: true,
  })

  app.register(fastifySensible)
  app.register(fastifyCors, {})
  // app.register(fastifyHelmet, {})

  app.register(fastifyAutoload, {
    dir: __dirname + '/routes',
    scriptPattern: /.*\.route\.(ts|js|cjs|mjs)$/,
  })

  // app.register(puppeteerPlugin, {
  //   browserIdleTimeout: 60,
  // })

  return app
}

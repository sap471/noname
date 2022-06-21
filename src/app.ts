import createFastify from 'fastify'
import fastifySensible from '@fastify/sensible'
import fastifyCors from '@fastify/cors'
import { v4 } from 'uuid'
import fastifyAutoload from '@fastify/autoload'
import { isProd } from './utils'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import puppeteerPlugin from './plugins/puppeteer.plugin'

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
              translateTime: 'd-mm-yy HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
    },
    genReqId: () => v4(),
    trustProxy: true,
  })

  app.register(fastifySensible)

  app.register(fastifyRateLimit, {
    global: false,
    max: 3000,
    errorResponseBuilder(req, context) {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `I only allow ${context.max} requests per ${context.after} to this Website. Try again soon.`,
        date: Date.now(),
        expiresIn: context.ttl, // milliseconds
      }
    },
  })

  app.register(fastifyCors, {})
  // app.register(fastifyHelmet, {})

  app.register(fastifyAutoload, {
    dir: __dirname + '/routes',
    scriptPattern: /.*\.route\.(ts|js|cjs|mjs)$/,
  })

  app.register(puppeteerPlugin, {
    runOnStart: false,
    browserIdleTimeout: 60,
  })

  return app
}

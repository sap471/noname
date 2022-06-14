import createFastify from 'fastify'
import fastifySensible from '@fastify/sensible'
import fastifyCors from '@fastify/cors'
import { v4 } from 'uuid'
import fastifyAutoload from '@fastify/autoload'

export default async function startApp() {
  try {
    const app = createFastify({
      logger: true,
      genReqId: () => v4(),
    })

    app.register(fastifySensible)
    app.register(fastifyCors)

    app.register(fastifyAutoload, {
      dir: __dirname + '/routes',
      scriptPattern: /.*\.route\.(ts|js|cjs|mjs)$/,
    })

    app.listen({
      port: Number(process.env.PORT) || 8080,
    })
  } catch (error) {
    throw error
    process.exit(1)
  }
}

startApp()

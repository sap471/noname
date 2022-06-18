import { FastifyPluginAsync } from 'fastify'

export const autoPrefix: string = '/todo'

export default <FastifyPluginAsync>async function (fastify, opts) {
  fastify.get('/', async (req, reply) => {
    reply.send({ name: 'todo-list' })
  })

  fastify.post('/', async (req, reply) => {
    reply.send({ name: 'todo-create' })
  })

  fastify.put<{
    Params: { itemId: string }
  }>('/:itemId', async (req, reply) => {
    reply.send({ name: `todo-${req.params.itemId}-update` })
  })

  fastify.delete<{
    Params: { itemId: string }
  }>('/:itemId', async (req, reply) => {
    reply.send({ name: `todo-${req.params.itemId}-delete` })
  })
}

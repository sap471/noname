import { ScreenshotOptions } from 'puppeteer'
import { FastifyPluginAsync, FastifyPluginCallback } from 'fastify'
import { JSONSchemaType } from 'ajv'
import { blockedDomains } from '../plugins/puppeteer.plugin'

enum ImageType {
  WEBP = 'webp',
  JPEG = 'jpeg',
  PNG = 'png',
}

interface screenshotQSArgs {
  weburl: string
  type: ImageType
  width: number
  height: number
  fullpage: boolean
  quality: number
}

const screenshotLimit: number = 2 // in one minutes
const screenshotExpires: number = 14 * 86400

export const autoPrefix = '/screenshot'

export default <FastifyPluginAsync>async function (fastify) {
  fastify.get<{
    Querystring: screenshotQSArgs
  }>(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            weburl: { type: 'string', format: 'url' },
            fullpage: { type: 'boolean', default: false },
            height: { type: 'number', default: 720 },
            width: { type: 'number', default: 1280 },
            type: { type: 'string', default: 'jpeg' },
            quality: { type: 'number', minimum: 10, maximum: 100, default: 90 },
          },
          required: ['weburl'],
        } as JSONSchemaType<screenshotQSArgs>,
      },
      preHandler: fastify.rateLimit({
        max: screenshotLimit,
        timeWindow: '1 minute',
        errorResponseBuilder: (req, ctx) => ({
          code: 429,
          error: 'To Many Request',
          message: `i'm sorry, due to the server load i limit the request just to ${screenshotLimit} for every 1 minute`,
          waitIn: `${ctx.ttl / 1000} seconds`,
        }),
      }),
    },
    async (req, reply) => {
      const { weburl, fullpage, type, height, width, quality } = req.query

      const browser = await fastify.browser()
      const page = await browser.newPage()

      await page.setViewport({ height, width, deviceScaleFactor: 1, hasTouch: false })
      await page._client().send('Animation.disable')
      await page.setRequestInterception(true)
      page.on('request', (request) => {
        const url = request.url()
        if (blockedDomains.some((domain) => url.includes(domain))) {
          request.abort()
        } else {
          request.continue()
        }
      })

      try {
        await page.goto(weburl, { waitUntil: 'networkidle2', timeout: 30000 })

        let screenshotOptions: Partial<ScreenshotOptions> = {
          fullPage: fullpage,
          type,
          encoding: 'binary',
          quality,
        }

        const result = await page.screenshot(screenshotOptions)

        reply.header('Content-Type', `image/${type}`)
        reply.headers({
          Expires: new Date(Date.now() + screenshotExpires).toISOString(),
          'Cache-Control': `public, max-age=${
            screenshotExpires * 2
          }, immutable, stale-while-revalidate=${screenshotExpires}`,
          'X-Screenshot-Url': weburl,
          'X-Screenshot-Time-Taken': new Date().toISOString(),
          'X-Screenshot-Is-Cached': false,
        })

        return result
      } catch (error: Error | any) {
        fastify.log.error(error)

        throw fastify.httpErrors.badRequest(error.message)
      } finally {
        await page.close()
      }
    },
  )
}

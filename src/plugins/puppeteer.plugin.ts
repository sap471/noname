import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import os from 'os'
import {
  Browser,
  LaunchOptions,
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
} from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import adBlockPlugin from 'puppeteer-extra-plugin-adblocker'

puppeteer.use(stealthPlugin())
puppeteer.use(adBlockPlugin({ blockTrackers: true }))

declare module 'fastify' {
  interface FastifyInstance {
    browser: () => Promise<Browser>
  }
}

export interface puppeteerPluginOptions {
  launchOptions: LaunchOptions & BrowserConnectOptions & BrowserLaunchArgumentOptions
  runOnStart: boolean
  browserIdleTimeout: number
  userAgent: string
  acceptLanguage: string
}

let browser: Browser
let browserTimer: ReturnType<typeof setTimeout>

const pluginOptions: puppeteerPluginOptions = {
  launchOptions: {
    headless: true,
    waitForInitialPage: false,
    ignoreHTTPSErrors: true,
    // userDataDir: '/tmp',
    args: [
      '--no-sandbox',
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-setuid-sandbox',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ],
  },
  runOnStart: false,
  browserIdleTimeout: 0,
  userAgent: '',
  acceptLanguage: '',
}

export const puppeteerPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  userOptions: Partial<puppeteerPluginOptions>,
) => {
  Object.assign(pluginOptions, userOptions)

  const { launchOptions, browserIdleTimeout } = pluginOptions

  if (browserIdleTimeout < 60)
    throw new Error(`timeout must be higher or equal 60 seconds, val: ${browserIdleTimeout}`)

  const logger = fastify.log.child({ module: 'puppeteerPlugin' })

  const clearTimeoutBrowser = () => {
    clearTimeout(browserTimer)
    if (browserIdleTimeout > 59) {
      if (browser && browser.isConnected()) {
        browserTimer = setTimeout(async () => {
          await stopBrowser()
          logger.info('browser closed by timeout')
        }, browserIdleTimeout * 1000)
      }
    }
  }

  const stopBrowser = async (): Promise<void> => {
    if (browser && browser.isConnected()) {
      clearTimeout(browserTimer)
      await browser.close()
    }
    logger.info('browser closed')
  }

  const initBrowser = async (): Promise<Browser> => {
    if (browser && browser.isConnected()) return browser

    logger.info('browser launched')

    // if (process.env['PUPPETEER_WSENDPOINT']) {
    //   browser = await puppeteer.connect({
    //     browserWSEndpoint: process.env['PUPPETEER_WSENDPOINT'],
    //   })
    // } else {
    // browser = await puppeteer.launch(launchOptions)
    // }

    browser = await puppeteer.launch({
      ...launchOptions,
      executablePath: detectGoogleChromeExecutable(),
    })

    browser.on('targetcreated', () => {
      logger.info('new tab created')
      let lastTimeout = browserTimer
      clearTimeoutBrowser()

      logger.info(`last timeout ${Number(lastTimeout)}, timeout reset: ${browserTimer}`)
    })

    clearTimeoutBrowser()

    return browser
  }

  fastify.addHook('onReady', async () => {
    if (pluginOptions.runOnStart) {
      await initBrowser()
    }
  })

  fastify.decorate('browser', initBrowser)

  fastify.addHook('onClose', (instance, done) =>
    stopBrowser()
      .then(() => done)
      .catch((reason) => done(reason)),
  )
}

/** use google chrome as default browser */
const detectGoogleChromeExecutable = () => {
  // https://stackoverflow.com/a/625902682
  const osPlatform = os.platform()
  let executablePath = undefined
  if (/^win/i.test(osPlatform)) {
    executablePath =
      os.arch() == 'x64' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined
  } else if (/^linux/i.test(osPlatform)) {
    executablePath = '/usr/bin/google-chrome'
  }

  return executablePath
}

export default fp<Partial<puppeteerPluginOptions>>(puppeteerPlugin, {
  name: 'fastify-puppeteer',
  fastify: '4.x.x',
})

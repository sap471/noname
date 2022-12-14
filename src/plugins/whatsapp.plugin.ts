import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import makeWASocket, {
  Browsers,
  delay,
  DisconnectReason,
  useMultiFileAuthState,
} from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'

interface ISessionStorage {}

export default <FastifyPluginAsyncTypebox>async function (fastify, options) {
  const session: Map<string, ISessionStorage> = new Map()

  const retryTimeout: number = 3000

  const startNewSession = async (sessionId: string) => {
    const { state, saveCreds } = await useMultiFileAuthState('')

    const wa = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      downloadHistory: false,
      syncFullHistory: false,
      browser: Browsers.macOS('chrome'),
    })

    setInterval(async () => {
      await saveCreds()
    }, 10000)

    wa.ev.process(async (events) => {
      if (events['connection.update']) {
        const { connection, lastDisconnect, qr } = events['connection.update']
        if (qr !== undefined) {
        }

        if (connection == 'close') {
          if ((lastDisconnect?.error as Boom).output.statusCode !== DisconnectReason.loggedOut) {
            await delay(3000)
            startNewSession(sessionId)
          } else {
            console.log('logged out, close!')
          }
        } else if (connection == 'open') {
        }
      }

      if (events['messages.upsert']) {
        return
      }
    })
  }
}

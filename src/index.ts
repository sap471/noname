import { createApp } from './app'

async function startApp() {
  try {
    const app = await createApp()

    await app.listen({
      port: Number(process.env.PORT) || 8080,
      host: '0.0.0.0',
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

startApp()
